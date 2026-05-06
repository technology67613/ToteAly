import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin as supabase, isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

// Mock data for fallback
const MOCK_ORDERS = [
  {
    id: "order-1001",
    total_amount: 1249,
    status: "Delivered",
    payment_status: "Paid",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    profiles: { name: "Ananya Sharma", email: "ananya@example.com" },
    order_items: [
      { name: "Premium Tote", price: 249, quantity: 1, is_customized: true }
    ],
    shipping_details: {
      address: "123 Green Park",
      city: "New Delhi",
      pincode: "110016",
      state: "Delhi"
    }
  }
];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isSupabaseConfigured()) {
      return process.env.NODE_ENV === "development"
        ? NextResponse.json(MOCK_ORDERS)
        : NextResponse.json({ error: "Supabase is required for admin orders." }, { status: 503 });
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY is required to read admin orders." },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Normalize for frontend
    const normalizedData = data.map((o: any) => ({
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status, payment_status } = await request.json();
    
    if (!isSupabaseConfigured()) {
       return NextResponse.json({ id, status, payment_status });
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
    return NextResponse.json(data[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
