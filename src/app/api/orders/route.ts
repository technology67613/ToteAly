import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase, supabaseAdmin, isSupabaseConfigured, isSupabaseAdminConfigured } from "@/lib/supabase";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { createShiprocketOrder } from "@/lib/shiprocket";
import { OrderCreateSchema } from "@/lib/validations";

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
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const validation = OrderCreateSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Invalid request data", 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const { items, totalAmount, paymentId, razorpayOrderId, razorpaySignature, shippingDetails } = validation.data;

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase is required to save orders." }, { status: 503 });
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
    const profileId = session?.user?.id || null;

    // Determine status based on payment method
    const isManualUPI = paymentId === 'MANUAL_UPI';
    const initialStatus = isManualUPI ? 'Pending' : 'Confirmed';
    const initialPaymentStatus = isManualUPI ? 'Pending' : 'Paid';

    // 2. Create the Order
    const { data: order, error: orderError } = await supabaseAdmin
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
      product_id: (item.productId && uuidPattern.test(item.productId)) ? item.productId : null,
      name: item.title,
      price: item.price,
      quantity: item.quantity,
      is_customized: item.isCustomized || false,
      customization_details: {
        ...(item.customizationDetails || {}),
        preview_image: getCustomizationPreview(item),
      }
    }));

    const { error: itemsError } = await supabaseAdmin
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
      // Run these in parallel but don't await to speed up response
      Promise.all([
        sendOrderConfirmationEmail(customerEmail, emailOrder).catch(err =>
          console.error("Delayed Order Email Error:", err)
        ),
        (initialStatus === 'Confirmed' && process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD)
          ? createShiprocketOrder({
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
            })
          : Promise.resolve(null)
      ]);
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!isSupabaseConfigured()) {
       return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    if (id) {
       // Single Order Lookup (Public Tracking)
       const { data: order, error } = await supabaseAdmin
         .from('orders')
         .select(`
           *,
           order_items (*)
         `)
         .eq('id', id)
         .single();

       if (error) {
         console.error("Order Lookup Error:", error);
         return NextResponse.json({ error: "Order not found" }, { status: 404 });
       }

       return NextResponse.json({
         ...order,
         _id: order.id,
         createdAt: order.created_at,
         products: order.order_items || [],
         totalAmount: order.total_amount,
         shippingDetails: order.shipping_details,
       });
    }

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is required to read orders." }, { status: 500 });
    }

    // Efficient filtering at the SQL level
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .filter('shipping_details->>email', 'eq', session.user.email)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const userOrders = (data || []).map((order: any) => ({
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
