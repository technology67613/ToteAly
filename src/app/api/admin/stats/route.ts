import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase, isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'month';
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "Supabase and SUPABASE_SERVICE_ROLE_KEY are required for admin stats." }, { status: 503 });
    }

    // 1. Fetch Basic Counts
    const [productsCount, profilesCount] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true })
    ]);

    // 2. Date Range Setup
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    if (fromParam && toParam) {
      startDate = new Date(fromParam);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(toParam);
      endDate.setHours(23, 59, 59, 999);
    } else {
      if (range === 'day') startDate.setHours(0, 0, 0, 0); 
      else if (range === 'week') startDate.setDate(now.getDate() - 7);
      else if (range === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0,0,0,0);
      }
      else if (range === 'year') startDate.setFullYear(now.getFullYear() - 1);
      else if (range === 'till_date') startDate = new Date(0);
    }

    // 3. Fetch Filtered Orders
    let query = supabase
      .from('orders')
      .select('total_amount, created_at, payment_status, user_id, status')
      .order('created_at', { ascending: true });

    if (range !== 'till_date' || (fromParam && toParam)) {
      query = query.gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString());
    }

    const { data: allOrders, error: orderError } = await query;
    if (orderError) throw orderError;

    const activeOrders = (allOrders || []).filter((o: any) => o.status?.toLowerCase() !== 'cancelled');
    const paidOrders = activeOrders.filter((o: any) => o.payment_status?.toLowerCase() === 'paid');
    const totalRevenue = paidOrders.reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);
    const rangeOrdersCount = activeOrders.length;

    // 4. Trend Logic
    const trendData: Record<string, number> = {};
    paidOrders.forEach((o: any) => {
      const date = new Date(o.created_at);
      let key = "";
      if (range === 'day') key = date.getHours() + ":00";
      else if (range === 'week' || range === 'month') key = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      else key = date.toLocaleString('default', { month: 'short' });
      trendData[key] = (trendData[key] || 0) + Number(o.total_amount);
    });

    // 5. Customer Logic (Include guests from orders)
    let customersCount = profilesCount.count || 0;
    if (customersCount === 0) {
        const { data: orderEmails } = await supabase.from('orders').select('shipping_details');
        const emails = new Set();
        (orderEmails || []).forEach((o: any) => {
          if (o.shipping_details?.email) emails.add(o.shipping_details.email);
        });
        customersCount = emails.size;
    }

    // 6. Categories Logic
    const { data: categoryData } = await supabase.from('products').select('category');
    const categoryCounts: Record<string, number> = {};
    (categoryData || []).forEach((p: any) => {
      const cat = p.category || 'General';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const totalProducts = productsCount.count || 1;
    const categoryDistribution = Object.entries(categoryCounts).map(([label, count]) => ({
      label,
      val: Math.round((count / totalProducts) * 100),
      color: label.includes('Plain') ? '#8B1A4A' : label.includes('Black') ? '#1A1A1A' : label.includes('Premium') ? '#C0A080' : '#FF69B4'
    }));

    // 7. Advanced Metrics
    const avgOrderValue = rangeOrdersCount > 0 
      ? `₹${Math.round(totalRevenue / rangeOrdersCount).toLocaleString('en-IN')}` 
      : '₹0';
    
    const customerLTV = customersCount > 0 
      ? `₹${Math.round(totalRevenue / customersCount).toLocaleString('en-IN')}` 
      : '₹0';

    // 8. Repeat Customer Rate (Track by Email for Guest repeats)
    const { data: orderData } = await supabase.from('orders').select('user_id, shipping_details, total_amount, status');
    const customerIdentifierCounts: Record<string, number> = {};
    
    (orderData || []).filter((o: any) => o.status?.toLowerCase() !== 'cancelled').forEach((o: any) => {
      const email = o.shipping_details?.email;
      const uid = o.user_id;
      const identifier = uid || email; // Priority to UID, fallback to Email
      if (identifier) {
        customerIdentifierCounts[identifier] = (customerIdentifierCounts[identifier] || 0) + 1;
      }
    });
    
    const repeatCustomers = Object.values(customerIdentifierCounts).filter(count => count > 1).length;
    const totalUniqueCustomers = Object.keys(customerIdentifierCounts).length || customersCount;
    const repeatRate = totalUniqueCustomers > 0 
      ? `${Math.round((repeatCustomers / totalUniqueCustomers) * 100)}%` 
      : '0%';

    // 9. Average Items per Order
    const { data: allItems } = await supabase.from('order_items').select('quantity, order_id');
    // Get valid order IDs to filter items
    const { data: validOrders } = await supabase.from('orders').select('id').neq('status', 'Cancelled');
    const validOrderIds = new Set((validOrders || []).map((o: any) => o.id));
    
    const totalItems = (allItems || []).filter((item: any) => validOrderIds.has(item.order_id)).reduce((sum: number, item: any) => sum + (Number(item.quantity) || 1), 0);
    const totalOrdersCount = validOrderIds.size;
    const avgItemsPerOrder = (totalOrdersCount || 0) > 0 
      ? (totalItems / (totalOrdersCount || 1)).toFixed(1) 
      : '0';

    // 10. Top Customers (Lifetime Value)
    const { data: allTimeOrders } = await supabase.from('orders').select('user_id, shipping_details, total_amount, status');
    const customerSpend: Record<string, { name: string, email: string, total: number, orders: number }> = {};
    const cityCounts: Record<string, number> = {};
    const stateCounts: Record<string, number> = {};

    (allTimeOrders || []).forEach((o: any) => {
      if (o.status?.toLowerCase() === 'cancelled') return;
      const email = o.shipping_details?.email;
      const name = o.shipping_details?.full_name || o.shipping_details?.name || 'Guest Customer';
      const city = o.shipping_details?.city || 'Unknown';
      const state = o.shipping_details?.state || 'Unknown';
      const identifier = o.user_id || email;
      
      if (identifier) {
        if (!customerSpend[identifier]) {
          customerSpend[identifier] = { name, email: email || 'No Email', total: 0, orders: 0 };
        }
        // Handle both camelCase and snake_case just in case
        const amount = Number(o.total_amount || o.totalAmount || 0);
        customerSpend[identifier].total += amount;
        customerSpend[identifier].orders += 1;
      }

      // Aggregate Geo Data
      if (city) cityCounts[city] = (cityCounts[city] || 0) + 1;
      if (state) stateCounts[state] = (stateCounts[state] || 0) + 1;
    });

    const topCustomers = Object.values(customerSpend)
      .sort((a, b) => b.total - a.total)
      .slice(0, 50);

    const cities = Object.entries(cityCounts).map(([label, val]) => ({ label, val }));
    const states = Object.entries(stateCounts).map(([label, val]) => ({ label, val }));

    // 11. Top Selling Products
    const { data: itemData } = await supabase.from('order_items').select('product_id, name, quantity, price, order_id');
    const productSales: Record<string, { name: string, qty: number, revenue: number }> = {};
    (itemData || []).forEach((item: any) => {
      if (!validOrderIds.has(item.order_id)) return;
      if (item.product_id) {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = { name: item.name || 'Unknown Product', qty: 0, revenue: 0 };
        }
        productSales[item.product_id].qty += (Number(item.quantity) || 1);
        productSales[item.product_id].revenue += (Number(item.price) * (Number(item.quantity) || 1));
      }
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // Today's revenue indicator
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    const todayRevenue = paidOrders.filter((o: any) => new Date(o.created_at) >= todayStart)
      .reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);

    return NextResponse.json({
      revenue: `₹${totalRevenue.toLocaleString('en-IN')}`,
      orders: rangeOrdersCount,
      products: productsCount.count || 0,
      customers: customersCount,
      trend: trendData,
      categories: categoryDistribution,
      avgOrderValue,
      customerLTV,
      repeatRate,
      avgItemsPerOrder,
      topCustomers,
      topProducts,
      cities,
      states,
      delta: {
        revenue: `₹${todayRevenue.toLocaleString('en-IN')} today`,
        orders: "Live",
        customers: "Total Buyers",
        products: "SKUs Active"
      }
    });
  } catch (error: any) {
    console.error("[ADMIN STATS ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
