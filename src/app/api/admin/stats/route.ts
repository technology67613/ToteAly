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
    const now = new Date();
    const currentMonth = now.getMonth();
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    
    let currentMonthRevenue = 0;
    let prevMonthRevenue = 0;

    (paidOrders || []).forEach((o: any) => {
      const date = new Date(o.created_at);
      const month = date.toLocaleString('default', { month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + Number(o.total_amount);
      
      if (date.getMonth() === currentMonth) currentMonthRevenue += Number(o.total_amount);
      if (date.getMonth() === prevMonth) prevMonthRevenue += Number(o.total_amount);
    });

    const revenueDelta = prevMonthRevenue > 0 
      ? (((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100).toFixed(1)
      : "0.0";

    // 3. Category Distribution
    const { data: categoryData } = await supabase
      .from('products')
      .select('category');
    
    const categoryCounts: Record<string, number> = {};
    (categoryData || []).forEach((p: any) => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });

    const totalProducts = productsCount.count || 1;
    const categoryDistribution = Object.entries(categoryCounts).map(([label, count]) => ({
      label,
      val: Math.round((count / totalProducts) * 100),
      color: label.includes('Plain') ? '#8B1A4A' : label.includes('Black') ? '#1A1A1A' : label.includes('Premium') ? '#C0A080' : '#FF69B4'
    }));

    return NextResponse.json({
      revenue: `₹${totalRevenue.toLocaleString('en-IN')}`,
      orders: ordersCount.count || 0,
      products: productsCount.count || 0,
      customers: customersCount.count || 0,
      trend: monthlyData,
      categories: categoryDistribution,
      delta: {
        revenue: `${Number(revenueDelta) >= 0 ? '+' : ''}${revenueDelta}%`,
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
