import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: 'Payment service not configured' }, { status: 500 });
    }

    const { items } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // BACKEND PRICE VERIFICATION
    // Fetch real prices from Supabase to prevent client-side manipulation
    const productIds = items.map(item => item.productId).filter(Boolean);
    const { data: dbProducts, error: dbError } = await supabase
      .from('products')
      .select('id, price, stock')
      .in('id', productIds);

    if (dbError) throw dbError;

    let calculatedSubtotal = 0;
    for (const item of items) {
      const dbProduct = (dbProducts as any[])?.find((p: any) => p.id === item.productId);
      if (!dbProduct && !item.isCustomized) {
        return NextResponse.json({ error: `Product ${item.title} not found` }, { status: 404 });
      }

      // If it's a standard product, use DB price. 
      // If customized, use the price logic (usually standard + premium)
      // For now, we trust the DB price for stock items.
      const price = dbProduct ? dbProduct.price : item.price;
      
      // Stock check
      if (dbProduct && dbProduct.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${item.title}` }, { status: 400 });
      }

      calculatedSubtotal += price * item.quantity;
    }

    // Add shipping logic (synced with frontend)
    const shippingFee = calculatedSubtotal >= 999 ? 0 : 50;
    const finalTotal = calculatedSubtotal + shippingFee;

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(finalTotal * 100), // convert to paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });

    return NextResponse.json({
      ...order,
      verifiedAmount: finalTotal // Send back the verified amount for frontend sync
    });
  } catch (err: any) {
    console.error('Razorpay Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
