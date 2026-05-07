import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

// Initialize Razorpay with error handling for missing keys
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn("Razorpay keys are missing.");
    return null;
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = "INR", receipt } = await request.json();
    
    if (!amount) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 });
    }

    const razorpay = getRazorpay();
    const options = {
      amount: Math.round(amount * 100), // Ensure it's an integer in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    };

    if (!razorpay) {
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 });
    }

    const order = await razorpay.orders.create(options);
    return NextResponse.json({ order });
    
  } catch (error: any) {
    console.error("Razorpay Order Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
