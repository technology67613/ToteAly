import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

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
    if (!isSupabaseConfigured()) {
      return NextResponse.json(MOCK_CUSTOMERS);
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

    return NextResponse.json(normalizedData.length > 0 ? normalizedData : MOCK_CUSTOMERS);
  } catch (error: any) {
    console.error("Customers Fetch Error:", error);
    return NextResponse.json(MOCK_CUSTOMERS);
  }
}
