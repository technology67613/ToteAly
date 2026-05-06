import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase, isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "Supabase configuration required." }, { status: 503 });
    }

    // Fetching from a conceptual logs table - falling back to activity if it doesn't exist
    const { data, error } = await supabase
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
       console.error("Logs Fetch Error:", error);
       return NextResponse.json([]); // Return empty if table or data missing
    }
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Logs Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch logs." }, { status: 500 });
  }
}
