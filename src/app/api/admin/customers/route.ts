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

    // 1. Fetch registered profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;
    
    // 2. Fetch all orders to extract guest customers and order counts
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('id, user_id, shipping_details, created_at');

    if (ordersError) throw ordersError;

    // Combine data
    const customerMap = new Map();

    // Add registered profiles
    (profiles || []).forEach((p: any) => {
      customerMap.set(p.id, {
        _id: p.id,
        id: p.id,
        name: p.full_name || p.email?.split('@')[0] || "User",
        email: p.email,
        createdAt: p.created_at,
        isGuest: false,
        orders: []
      });
    });

    // Add guests and associate orders
    (ordersData || []).forEach((o: any) => {
      const email = o.shipping_details?.email;
      if (o.user_id && customerMap.has(o.user_id)) {
        // Registered user order
        customerMap.get(o.user_id).orders.push(o);
      } else if (email) {
        // Guest user order
        if (!customerMap.has(email)) {
          customerMap.set(email, {
            _id: email,
            id: email,
            name: o.shipping_details?.name || email.split('@')[0],
            email: email,
            createdAt: o.created_at, // use first order date
            isGuest: true,
            orders: []
          });
        }
        customerMap.get(email).orders.push(o);
      }
    });

    const normalizedData = Array.from(customerMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(normalizedData);
  } catch (error: any) {
    console.error("Customers Fetch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
