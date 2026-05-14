import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Validate env vars first
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Missing Razorpay env vars');
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const body = await req.json();
    const amount = body.amount; // in rupees, we convert to paise below

    console.log('Creating Razorpay order for amount:', amount);

    if (!amount || isNaN(amount) || amount <= 0) {
      console.error('Invalid amount received:', amount);
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    try {
      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // convert ₹ to paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
      });

      console.log('Razorpay order created successfully:', order.id);
      return NextResponse.json(order);
    } catch (razorpayError: any) {
      console.error('Razorpay API error:', razorpayError);
      return NextResponse.json(
        { error: razorpayError?.description || razorpayError?.message || 'Razorpay order creation failed' },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error('General checkout API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
