import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase, isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Product ID required" }, { status: 400 });

    if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "Supabase configuration required." }, { status: 503 });
    }

    // 1. Fetch Product Basic Info
    const { data: product, error: pError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (pError) throw pError;

    // 2. Fetch Sales Stats from order_items
    const { data: salesData, error: sError } = await supabase
      .from('order_items')
      .select(`
        quantity,
        price,
        orders!inner (
          created_at,
          payment_status
        )
      `)
      .eq('product_id', id)
      .eq('orders.payment_status', 'Paid');

    if (sError) throw sError;

    const totalUnitsSold = (salesData || []).reduce((sum: number, item: any) => sum + item.quantity, 0);
    const totalRevenue = (salesData || []).reduce((sum: number, item: any) => sum + (item.quantity * Number(item.price)), 0);

    // 3. Fetch Recent Reviews
    const { data: reviews, error: rError } = await supabase
      .from('reviews')
      .select('rating, comment, created_at, profiles(name)')
      .eq('product_id', id)
      .order('created_at', { ascending: false })
      .limit(5);

    const avgRating = reviews && reviews.length > 0 
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length 
      : 0;

    // 4. Monthly Trend (last 6 months)
    const monthlyTrend: Record<string, number> = {};
    (salesData || []).forEach((item: any) => {
        const date = new Date(item.orders.created_at);
        const month = date.toLocaleString('default', { month: 'short' });
        monthlyTrend[month] = (monthlyTrend[month] || 0) + item.quantity;
    });

    return NextResponse.json({
      product,
      stats: {
        totalUnitsSold,
        totalRevenue,
        avgRating,
        reviewCount: reviews?.length || 0,
        recentReviews: reviews || [],
        monthlyTrend
      }
    });

  } catch (error: any) {
    console.error("Product Stats API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
