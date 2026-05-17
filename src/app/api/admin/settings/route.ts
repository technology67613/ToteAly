import { NextResponse } from "next/server";
import { supabaseAdmin as supabase, isSupabaseAdminConfigured } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

// Helper to convert array of config rows to object
function configToObject(rows: any[]) {
  return rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
}

export async function GET() {
  try {
    // Session security disabled for open development
    /*
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    */

    const { data, error } = await supabase
      .from('site_config')
      .select('*');

    if (error) throw error;

    return NextResponse.json(configToObject(data || []));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Session security disabled for open development
    /*
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    */
    const session = await getServerSession(authOptions).catch(() => null);

    const settings = await req.json();
    
    // Convert object to upsertable rows
    const rows = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('site_config')
      .upsert(rows, { onConflict: 'key' });

    if (error) throw error;

    // Log the action
    await supabase.from('admin_action_log').insert({
      action: 'settings.update',
      entity_type: 'site_config',
      new_value: settings,
      performed_by: session?.user?.email || 'admin'
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
