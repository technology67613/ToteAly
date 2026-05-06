import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Shiprocket Webhook Listener
 * Receives real-time tracking updates from Shiprocket.
 * Expected payload: { order_id, status, ... }
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log("Shiprocket Webhook Received:", payload);

    const { order_id, status } = payload;

    if (!order_id || !status) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
       console.warn("Supabase not configured, skipping webhook update.");
       return NextResponse.json({ success: true, message: "Mock success" });
    }

    // Shiprocket statuses: AWBs Assigned, Picked Up, Shipped, Delivered, etc.
    // We map these to our internal statuses if needed.
    let mappedStatus = status;
    if (status === "Canceled") mappedStatus = "Cancelled";
    if (status === "Delivered") mappedStatus = "Delivered";
    if (status === "Shipped" || status === "Picked Up") mappedStatus = "Shipped";

    // Update status in Supabase
    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update({ status: mappedStatus })
      .eq('id', order_id)
      .select()
      .single();

    if (error) {
      console.error("Supabase Update Error:", error);
      throw error;
    }

    if (!updatedOrder) {
      console.warn(`Webhook received for unknown order: ${order_id}`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    console.log(`Order ${order_id} status updated to ${mappedStatus} via webhook.`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
