import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

// GET all approved reviews for a product
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from("reviews")
      .select("*, profiles(name, avatar_url)")
      .eq("product_id", id)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST a new review
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { rating, comment } = await req.json();
    if (!rating) return NextResponse.json({ error: "Rating is required" }, { status: 400 });

    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("reviews")
      .insert({
        user_id: (session.user as any).id,
        product_id: id,
        rating,
        comment,
        status: "pending" // Admin must approve
      });

    if (error) throw error;
    return NextResponse.json({ success: true, message: "Review submitted for approval!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
