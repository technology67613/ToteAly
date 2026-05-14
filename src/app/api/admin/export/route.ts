import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'orders';

    let data: any[] = [];
    let headers: string[] = [];
    let filename = `export-${type}-${Date.now()}.csv`;

    if (type === 'orders') {
      const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      data = orders || [];
      headers = ['ID', 'Customer', 'Email', 'Total', 'Status', 'Date'];
    } else if (type === 'products') {
      const { data: products } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      data = products || [];
      headers = ['ID', 'Title', 'Price', 'Category', 'Stock'];
    } else if (type === 'subscribers') {
      const { data: subs } = await supabase.from('newsletter_subscribers').select('*').order('subscribed_at', { ascending: false });
      data = subs || [];
      headers = ['ID', 'Email', 'Joined At'];
    }

    // Convert to CSV
    const csvRows = [headers.join(',')];
    data.forEach(row => {
      const values = headers.map(h => {
        const key = h.toLowerCase().replace(' ', '_');
        let val = row[key] || '';
        if (h === 'Date') val = new Date(row.created_at).toLocaleDateString();
        if (h === 'Joined At') val = new Date(row.subscribed_at).toLocaleDateString();
        // Simple escaping
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = csvRows.join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
