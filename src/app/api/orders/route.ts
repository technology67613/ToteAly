import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { supabaseAdmin as supabase, isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/supabase";
import crypto from "crypto";
import { createShiprocketOrder } from "@/lib/shiprocket";
import { sendOrderConfirmationEmail } from "@/lib/email";

export const runtime = "nodejs";

function getCustomizationPreview(item: any) {
  return item.customizationDetails?.preview ||
    item.customizationDetails?.preview_image ||
    item.customizationDetails?.canvasData ||
    item.image ||
    null;
}

export async function POST(request: NextRequest) {
  try {
    const { items, totalAmount, paymentId, razorpayOrderId, razorpaySignature, shippingDetails } = await request.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart items are required" }, { status: 400 });
    }

    if (!shippingDetails?.email || !shippingDetails?.name || !shippingDetails?.phone || !shippingDetails?.address) {
      return NextResponse.json({ error: "Customer and shipping details are required" }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      if (process.env.NODE_ENV !== "development") {
        return NextResponse.json({ error: "Supabase is required to save orders." }, { status: 503 });
      }

       const mockOrder = {
         id: `mock-${Date.now()}`,
         created_at: new Date().toISOString(),
         items,
         order_items: items.map((item: any) => ({
           name: item.title,
           price: item.price,
           quantity: item.quantity,
           is_customized: item.isCustomized || false,
         customization_details: {
           ...(item.customizationDetails || {}),
           preview_image: getCustomizationPreview(item),
         },
         })),
         total_amount: totalAmount,
         payment_id: paymentId,
         payment_status: paymentId === "MANUAL_UPI" ? "Pending" : "Paid",
         status: paymentId === "MANUAL_UPI" ? "Pending" : "Confirmed",
         shipping_details: shippingDetails,
       };
       const customerEmail = shippingDetails?.email;
       if (customerEmail) {
         sendOrderConfirmationEmail(customerEmail, mockOrder).catch(err =>
           console.error("Delayed Mock Order Email Error:", err)
         );
       }
       return NextResponse.json({ _id: mockOrder.id, items }, { status: 201 });
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY is required to save orders." },
        { status: 500 }
      );
    }

    // Verify Razorpay Signature if not a manual UPI payment
    if (paymentId !== 'MANUAL_UPI') {
      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (!secret) {
        console.error("RAZORPAY_KEY_SECRET is missing");
        return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
      }

      const generated_signature = crypto
        .createHmac("sha256", secret)
        .update(razorpayOrderId + "|" + paymentId)
        .digest("hex");

      if (generated_signature !== razorpaySignature) {
        return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
      }
    }

    // Guest checkout stores customer data in shipping_details. Logged-in profile
    // linking can be added later without blocking order creation.
    const profileId = null;

    // Determine status based on payment method
    const isManualUPI = paymentId === 'MANUAL_UPI';
    const initialStatus = isManualUPI ? 'Pending' : 'Confirmed';
    const initialPaymentStatus = isManualUPI ? 'Pending' : 'Paid';

    // 2. Create the Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: profileId,
        total_amount: totalAmount,
        status: initialStatus,
        payment_status: initialPaymentStatus,
        payment_id: paymentId,
        shipping_details: shippingDetails
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // 3. Create Order Items
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: uuidPattern.test(item.productId || "") ? item.productId : null,
      name: item.title,
      price: item.price,
      quantity: item.quantity,
      is_customized: item.isCustomized || false,
      customization_details: {
        ...(item.customizationDetails || {}),
        preview_image: getCustomizationPreview(item),
      }
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items insert failed after order creation:", itemsError);
    }

    const emailOrder = {
      ...order,
      order_items: orderItems,
      total_amount: totalAmount,
      payment_id: paymentId,
      payment_status: initialPaymentStatus,
      status: initialStatus,
      shipping_details: shippingDetails,
    };

    const customerEmail = shippingDetails?.email;
    if (customerEmail) {
      sendOrderConfirmationEmail(customerEmail, emailOrder).catch(err =>
        console.error("Delayed Order Email Error:", err)
      );
    } else {
      console.warn("Order email skipped because no customer email was provided.");
    }

    // 4. Trigger Shiprocket Automation if paid
    if (initialStatus === 'Confirmed' && process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD) {
      createShiprocketOrder({
        _id: order.id,
        createdAt: order.created_at,
        totalAmount: totalAmount,
        shippingDetails: shippingDetails,
        products: items.map((i: any) => ({
           name: i.title,
           quantity: i.quantity,
           price: i.price,
           isCustomized: i.isCustomized
        }))
      }).catch(shipError => {
        console.error("Shiprocket Automation Delayed/Failed:", shipError);
      });
    }

    return NextResponse.json({
      id: order.id,
      ...order,
      order_items: itemsError ? [] : orderItems,
      warning: itemsError ? "Order saved, but line items could not be saved." : undefined,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Order Save Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isSupabaseConfigured()) {
      return process.env.NODE_ENV === "development"
        ? NextResponse.json([])
        : NextResponse.json({ error: "Supabase is required for orders." }, { status: 503 });
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is required to read orders." }, { status: 500 });
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    const userOrders = (data || [])
      .filter((order: any) => order.shipping_details?.email === session.user.email)
      .map((order: any) => ({
        ...order,
        _id: order.id,
        createdAt: order.created_at,
        products: order.order_items || [],
        totalAmount: order.total_amount,
        shippingDetails: order.shipping_details,
      }));

    return NextResponse.json(userOrders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
