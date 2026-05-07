import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

function normalizeProduct(p: any) {
  return {
    ...p,
    _id: p.id,
    isCustomizable: p.is_customizable,
    isFeatured: p.is_featured,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isFeatured = searchParams.get("featured") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = (page - 1) * limit;

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase configuration is required." }, { status: 503 });
    }

    let query = supabase
      .from('products')
      .select('*');

    if (isFeatured) {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const normalizedData = (data || []).map(normalizeProduct);

    return NextResponse.json(normalizedData);
  } catch (error: any) {
    console.error("Supabase Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch products from cloud." }, { status: 500 });
  }
}
