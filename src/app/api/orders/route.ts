import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import crypto from "crypto";
import { createShiprocketOrder } from "@/lib/shiprocket";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { items, totalAmount, paymentId, razorpayOrderId, razorpaySignature, shippingDetails } = await request.json();

    if (!isSupabaseConfigured()) {
       return NextResponse.json({ _id: `mock-${Date.now()}`, items }, { status: 201 });
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

    // 1. Get User Profile ID if logged in
    let profileId = null;
    if (session?.user?.email) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', session.user.email)
        .single();
      profileId = profile?.id;
    }

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
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId?.startsWith('mock') ? null : item.productId,
      name: item.title,
      price: item.price,
      quantity: item.quantity,
      is_customized: item.isCustomized || false,
      customization_details: item.customizationDetails || {}
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // 4. Trigger Shiprocket Automation if paid
    if (initialStatus === 'Confirmed') {
      try {
        await createShiprocketOrder({
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
        });
      } catch (shipError) {
        console.error("Shiprocket Automation Delayed/Failed:", shipError);
        // We don't fail the whole order if shipping automation fails
      }
    }

    return NextResponse.json({ id: order.id, ...order }, { status: 201 });
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
       return NextResponse.json([]);
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
