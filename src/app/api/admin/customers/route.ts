import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase, isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "Supabase and SUPABASE_SERVICE_ROLE_KEY are required to read customers." }, { status: 503 });
    }

    if (id) {
      const { data: customer, error: customerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (customerError) throw customerError;

      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false });

      return NextResponse.json({
        ...customer,
        _id: customer.id,
        orders: orders || []
      });
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Normalize for frontend
    const normalizedData = data.map((c: any) => ({
      ...c,
      _id: c.id,
      createdAt: c.created_at
    }));

    return NextResponse.json(normalizedData);
  } catch (error: any) {
    console.error("Customers Fetch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
