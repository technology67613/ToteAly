import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin as supabase, isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

// Mock data for fallback
const MOCK_CUSTOMERS = [
  {
    id: "cust-1",
    name: "Ananya Sharma",
    email: "ananya@example.com",
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    status: "Active"
  }
];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isSupabaseConfigured()) {
      return process.env.NODE_ENV === "development"
        ? NextResponse.json(MOCK_CUSTOMERS)
        : NextResponse.json({ error: "Supabase is required for customers." }, { status: 503 });
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is required to read customers." }, { status: 500 });
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
