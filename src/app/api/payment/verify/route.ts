import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = await request.json();

    // Create the expected signature using your secret key
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_123')
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // 1. Update Supabase order status to 'paid'
      if (order_id) {
        const { data: orderDetails } = await supabase
          .from('orders')
          .update({ payment_status: 'paid', payment_id: razorpay_payment_id })
          .eq('id', order_id)
          .select()
          .single();

        if (orderDetails) {
          // Fetch order items and shipping details for the email
          const { data: items } = await supabase
            .from('order_items')
            .select('*, products(images)')
            .eq('order_id', order_id);
            
          const fullOrderDetails = {
            ...orderDetails,
            items: items || [],
          };
          
          // 2. Trigger Nodemailer to send the Order Confirmation Email here!
          const customerEmail = orderDetails.shipping_details?.email;
          if (customerEmail) {
            await sendOrderConfirmationEmail(customerEmail, fullOrderDetails);
          }
        }
      }
      
      return NextResponse.json({ message: "Payment verified successfully" }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
