import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase, isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    /*
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    */

    if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    // Fetch only unread notifications
    const { data, error } = await supabase
      .from('admin_notifications')
      .select('*')
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    const formatted = (data || []).map((n: any) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      time: n.created_at,
      priority: 'high'
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("[NOTIFICATIONS ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    /*
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    */

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const markAll = searchParams.get('all') === 'true';

    let error;

    if (markAll) {
      const res = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('is_read', false);
      error = res.error;
    } else if (id) {
      const res = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('id', id);
      error = res.error;
    } else {
      return NextResponse.json({ error: "No ID provided" }, { status: 400 });
    }

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
