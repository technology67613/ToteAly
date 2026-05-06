import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase, isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "Supabase configuration required." }, { status: 503 });
    }

    // Fetch last 5 orders
    const { data: orders } = await supabase
      .from('orders')
      .select('id, created_at, total_amount, profiles(name)')
      .order('created_at', { ascending: false })
      .limit(5);

    // Fetch last 5 inquiries
    const { data: inquiries } = await supabase
      .from('contact_messages')
      .select('id, created_at, name, subject')
      .order('created_at', { ascending: false })
      .limit(5);

    // Fetch last 5 subscribers
    const { data: subscribers } = await supabase
      .from('newsletter_subscribers')
      .select('id, subscribed_at, email')
      .order('subscribed_at', { ascending: false })
      .limit(5);

    const activities = [
      ...(orders?.map(o => ({
        id: o.id,
        type: 'order',
        title: `New Order from ${o.profiles?.name || 'Guest'}`,
        description: `Total: ₹${o.total_amount}`,
        time: o.created_at
      })) || []),
      ...(inquiries?.map(i => ({
        id: i.id,
        type: 'inquiry',
        title: `New Inquiry: ${i.subject}`,
        description: `From ${i.name}`,
        time: i.created_at
      })) || []),
      ...(subscribers?.map(s => ({
        id: s.id,
        type: 'subscriber',
        title: `New Community Member`,
        description: `${s.email} just joined`,
        time: s.subscribed_at
      })) || [])
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

    return NextResponse.json(activities);
  } catch (error: any) {
    console.error("Activity Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch activity." }, { status: 500 });
  }
}
