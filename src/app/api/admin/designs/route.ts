import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    /*
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    */

    const { data, error } = await supabase
      .from('custom_designs')
      .select('*, profiles(name, email)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    /*
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    */
    const session = await getServerSession(authOptions).catch(() => null);

    const { id, status, admin_notes } = await req.json();

    const { error } = await supabase
      .from('custom_designs')
      .update({ 
        status, 
        admin_notes,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) throw error;

    // Log action
    await supabase.from('admin_action_log').insert({
      action: `design.${status}`,
      entity_type: 'custom_design',
      entity_id: id,
      performed_by: session?.user?.email || 'admin'
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
