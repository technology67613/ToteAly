import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase, isSupabaseConfigured } from "@/lib/supabase";
import { FALLBACK_PRODUCTS } from "@/lib/catalog";

export const runtime = "nodejs";
export const revalidate = 60; // Cache for 60 seconds

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
      const products = isFeatured
        ? FALLBACK_PRODUCTS.filter((product) => product.is_featured)
        : FALLBACK_PRODUCTS;

      return NextResponse.json(products.slice(offset, offset + limit));
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
    const products = (new URL(request.url).searchParams.get("featured") === "true")
      ? FALLBACK_PRODUCTS.filter((product) => product.is_featured)
      : FALLBACK_PRODUCTS;

    return NextResponse.json(products);
  }
}
