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

    if (!amount || isNaN(amount)) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    console.log('Creating Razorpay order for amount:', amount);
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // convert ₹ to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    return NextResponse.json(order);
  } catch (err: any) {
    console.error('Razorpay order creation failed:', err);
    
    // Provide a more descriptive error message if available
    const errorMessage = err?.error?.description || err?.message || 'Failed to create payment order';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: err?.error || err 
      },
      { status: 500 }
    );
  }
}
