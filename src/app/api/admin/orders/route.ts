import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase, isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/supabase";
import { sendPaymentConfirmedEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase configuration is required." }, { status: 503 });
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json(
        { error: "Unauthorized: SUPABASE_SERVICE_ROLE_KEY required for admin order management." },
        { status: 401 }
      );
    }

    const query = supabase
      .from('orders')
      .select(`
        *,
        order_items (*, products(title, images, price, category)),
        profiles:user_id (*)
      `);

    if (id) {
      const { data, error } = await query.eq('id', id).single();
      if (error) throw error;
      
      return NextResponse.json({
        ...data,
        _id: data.id,
        user: data.profiles || {
          name: data.shipping_details?.name,
          email: data.shipping_details?.email,
        },
        products: data.order_items,
        totalAmount: data.total_amount,
        shippingDetails: data.shipping_details,
      });
    }

    const { data, error } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Normalize for frontend
    const normalizedData = (data || []).map((o: any) => ({
      ...o,
      _id: o.id,
      user: o.profiles || {
        name: o.shipping_details?.name,
        email: o.shipping_details?.email,
      },
      products: o.order_items,
      totalAmount: o.total_amount,
      shippingDetails: o.shipping_details,
    }));

    return NextResponse.json(normalizedData);
  } catch (error: any) {
    console.error("Orders Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch orders from cloud." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status, payment_status } = await request.json();
    
    if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
       return NextResponse.json({ error: "Supabase configuration required for cloud updates." }, { status: 503 });
    }

    // 1. Fetch current order to check status change
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*, order_items(*, products(title, images))')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const updatePayload: any = {};
    if (status) updatePayload.status = status;
    if (payment_status) updatePayload.payment_status = payment_status;

    // Special case: Manual UPI approval
    const isManualUPI = currentOrder.payment_id === 'MANUAL_UPI';
    const isApproving = status?.toLowerCase() === 'confirmed' || status?.toLowerCase() === 'paid';

    if (isManualUPI && isApproving) {
      updatePayload.payment_status = 'paid';
      updatePayload.status = 'Confirmed';
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // 2. Send confirmation email if approved
    const wasPending = currentOrder.status?.toLowerCase() === 'pending';
    
    if (isManualUPI && wasPending && isApproving) {
      console.log("Manual UPI Approved. Preparing email for order:", id);
      const emailOrder = {
        ...updatedOrder,
        order_items: (currentOrder.order_items || []).map((item: any) => ({
          ...item,
          name: item.products?.title || item.product_title || "Custom Tote Bag",
          price: Number(item.price || 0),
          quantity: Number(item.quantity || 1)
        })),
        total_amount: Number(updatedOrder.total_amount || 0)
      };
      
      const customerEmail = updatedOrder.shipping_details?.email;
      if (customerEmail) {
        try {
          await sendPaymentConfirmedEmail(customerEmail, emailOrder);
          console.log("Payment confirmation email sent to:", customerEmail);
        } catch (emailErr) {
          console.error("Email sending failed:", emailErr);
        }
      }
    }

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error("Order Patch Error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to update order in cloud.",
      details: error
    }, { status: 500 });
  }
}
