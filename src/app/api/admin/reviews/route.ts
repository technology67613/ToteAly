import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase, isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "Supabase configuration required." }, { status: 503 });
    }

    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles(name, avatar_url), products(title)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Map status to is_approved for backward compatibility if needed, 
    // but we'll update the component to use status.
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Reviews Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) return NextResponse.json({ error: "ID and Status required." }, { status: 400 });

    const { error } = await supabase
      .from('reviews')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Review Update Error:", error);
    return NextResponse.json({ error: "Failed to update review." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required." }, { status: 400 });

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Review Delete Error:", error);
    return NextResponse.json({ error: "Failed to delete review." }, { status: 500 });
  }
}
