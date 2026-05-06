import { NextResponse } from "next/server";
import { supabaseAdmin as supabase, isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  try {
    if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "Supabase and SUPABASE_SERVICE_ROLE_KEY are required to read customers." }, { status: 503 });
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Normalize for frontend
    const normalizedData = data.map((c: any) => ({
      ...c,
      _id: c.id,
      createdAt: c.created_at
    }));

    return NextResponse.json(normalizedData);
  } catch (error: any) {
    console.error("Customers Fetch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
