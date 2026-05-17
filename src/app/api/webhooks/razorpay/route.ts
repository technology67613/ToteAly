import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin as supabase, isSupabaseAdminConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret || !signature) {
      console.error("[WEBHOOK ERROR] Missing secret or signature");
      return NextResponse.json({ error: "Configuration error" }, { status: 400 });
    }

    // 1. Verify Signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("[WEBHOOK ERROR] Signature mismatch");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(body);
    const event = payload.event;
    const payment = payload.payload.payment.entity;
    const razorpayOrderId = payment.order_id;

    console.log(`[RAZORPAY WEBHOOK] Received event: ${event} for order: ${razorpayOrderId}`);

    if (event === "payment.captured") {
      if (!isSupabaseAdminConfigured()) throw new Error("DB not configured");

      // Update Order Status if not already updated
      const { data: order, error: findError } = await supabase
        .from('orders')
        .select('id, status')
        .eq('razorpay_order_id', razorpayOrderId)
        .single();

      if (findError || !order) {
        console.warn("[WEBHOOK WARN] Order not found for Razorpay ID:", razorpayOrderId);
        return NextResponse.json({ message: "Order not found" });
      }

      if (order.status === 'Pending') {
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            status: 'Confirmed',
            payment_status: 'Paid',
            payment_id: payment.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id);

        if (updateError) throw updateError;
        console.log("[WEBHOOK SUCCESS] Order confirmed via webhook:", order.id);
      }
    }

    return NextResponse.json({ status: "ok" });

  } catch (error: any) {
    console.error("[WEBHOOK EXCEPTION]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
