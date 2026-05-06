import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase, isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
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

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
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

    const updatePayload: any = {};
    if (status) updatePayload.status = status;
    if (payment_status) updatePayload.payment_status = payment_status;

    const { data, error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', id)
      .select();

    if (error) throw error;
    return NextResponse.json(data ? data[0] : null);
  } catch (error: any) {
    console.error("Order Patch Error:", error);
    return NextResponse.json({ error: "Failed to update order in cloud." }, { status: 500 });
  }
}
