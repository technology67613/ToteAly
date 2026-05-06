import { NextResponse } from "next/server";
import { supabaseAdmin as supabase, isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  try {
    if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "Supabase and SUPABASE_SERVICE_ROLE_KEY are required for admin stats." }, { status: 503 });
    }

    // 1. Fetch Counts
    const [ordersCount, productsCount, customersCount] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true })
    ]);

    // 2. Calculate Revenue & Monthly Stats for Charting
    const { data: paidOrders } = await supabase
      .from('orders')
      .select('total_amount, created_at')
      .eq('payment_status', 'Paid');

    const totalRevenue = (paidOrders || []).reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);

    // Group by month for trend
    const monthlyData: Record<string, number> = {};
    (paidOrders || []).forEach((o: any) => {
      const month = new Date(o.created_at).toLocaleString('default', { month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + Number(o.total_amount);
    });

    return NextResponse.json({
      revenue: `₹${totalRevenue.toLocaleString('en-IN')}`,
      orders: ordersCount.count || 0,
      products: productsCount.count || 0,
      customers: customersCount.count || 0,
      trend: monthlyData,
      delta: {
        revenue: "+0%",
        orders: "Live",
        products: "Synced",
        customers: "Active"
      }
    });
  } catch (error: any) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
