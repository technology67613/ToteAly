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
    const session = await getServerSession(authOptions).catch(() => null);

    const { id, ids, status, admin_notes } = await req.json();

    if (ids && Array.isArray(ids)) {
      const { error } = await supabase
        .from('custom_designs')
        .update({ 
          status, 
          admin_notes,
          updated_at: new Date().toISOString() 
        })
        .in('id', ids);

      if (error) throw error;

      // Log action
      await supabase.from('admin_action_log').insert({
        action: `design.batch_${status}`,
        entity_type: 'custom_design',
        new_value: { updated_ids: ids },
        performed_by: session?.user?.email || 'admin'
      });

      return NextResponse.json({ success: true, count: ids.length });
    }

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

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions).catch(() => null);
    const url = new URL(req.url);
    const queryIds = url.searchParams.get("ids");
    let ids: string[] = [];

    if (queryIds) {
      ids = queryIds.split(",");
    } else {
      try {
        const body = await req.json();
        if (body.ids && Array.isArray(body.ids)) {
          ids = body.ids;
        } else if (body.id) {
          ids = [body.id];
        }
      } catch (e) {
        // empty body
      }
    }

    if (ids.length === 0) {
      return NextResponse.json({ error: "No design IDs provided" }, { status: 400 });
    }

    const { error } = await supabase
      .from('custom_designs')
      .delete()
      .in('id', ids);

    if (error) throw error;

    // Log action
    await supabase.from('admin_action_log').insert({
      action: 'design.purge_batch',
      entity_type: 'custom_design',
      new_value: { purged_ids: ids },
      performed_by: session?.user?.email || 'admin'
    });

    return NextResponse.json({ success: true, message: `${ids.length} masterpieces purged successfully.` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
