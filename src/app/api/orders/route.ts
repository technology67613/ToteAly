import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { OrderCreateSchema } from "@/lib/validations";

export const runtime = "nodejs";

function isUuid(value: unknown): value is string {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const validation = OrderCreateSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    const { items, paymentId, razorpayOrderId, razorpaySignature, shippingDetails } = validation.data;

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // 1. BACKEND PRICE RE-VERIFICATION (Final Security Gate)
    const productIds = items.map((i: any) => i.productId).filter(Boolean);
    const { data: dbProducts } = await supabaseAdmin
      .from('products')
      .select('id, price, stock')
      .in('id', productIds);

    let verifiedSubtotal = 0;
    const finalOrderItems = items.map((item: any) => {
      const dbProduct = (dbProducts as any[])?.find((p: any) => p.id === item.productId);
      const price = dbProduct ? dbProduct.price : item.price;
      verifiedSubtotal += price * item.quantity;
      
      return {
        product_id: dbProduct ? dbProduct.id : null,
        product_title: item.title,
        product_image: item.image,
        product_category: item.category,
        price: price,
        quantity: item.quantity,
        is_customized: item.isCustomized || false,
        customization_details: item.customizationDetails || {}
      };
    });

    const shippingFee = verifiedSubtotal >= 999 ? 0 : 50;
    const verifiedTotalAmount = verifiedSubtotal + shippingFee;

    // 2. Razorpay Signature Verification
    if (paymentId !== 'MANUAL_UPI') {
      const secret = process.env.RAZORPAY_KEY_SECRET;
      const generated_signature = crypto
        .createHmac("sha256", secret!)
        .update(razorpayOrderId + "|" + paymentId)
        .digest("hex");

      if (generated_signature !== razorpaySignature) {
        return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
      }
    }

    // 3. Persist Order
    const profileId = isUuid((session?.user as any)?.id) ? (session?.user as any).id : null;
    const isManualUPI = paymentId === 'MANUAL_UPI';

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([{
        user_id: profileId,
        total_amount: verifiedTotalAmount,
        status: isManualUPI ? 'Pending' : 'Confirmed',
        payment_status: isManualUPI ? 'Pending' : 'Paid',
        payment_id: paymentId,
        payment_method: isManualUPI ? 'Manual UPI' : 'Razorpay',
        shipping_details: shippingDetails,
        notes: shippingDetails.notes
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // 4. Persist Order Items (Triggers stock decrement in DB)
    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(finalOrderItems.map(item => ({ ...item, order_id: order.id })));

    if (itemsError) console.error("Order Items Error:", itemsError);

    // 5. Async Tasks
    const customerEmail = shippingDetails?.email;
    if (customerEmail) {
      sendOrderConfirmationEmail(customerEmail, { ...order, order_items: items }).catch(console.error);
    }

    return NextResponse.json({ id: order.id, totalAmount: verifiedTotalAmount }, { status: 201 });

  } catch (error: any) {
    console.error("Order API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // ... (Keeping existing GET logic but ensuring it's robust)
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single();
    if (error) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(order);
  }

  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .filter('shipping_details->>email', 'eq', session.user.email)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
