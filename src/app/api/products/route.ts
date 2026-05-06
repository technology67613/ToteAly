import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase, isSupabaseConfigured } from "@/lib/supabase";

// Mock data for fallback if Supabase is not configured
const MOCK_PRODUCTS = [
  {
    id: "mock-1",
    title: "Classic Canvas Tote",
    description: "The original durable canvas bag for everyday use.",
    price: 499,
    category: "Plain Totes",
    images: ["/mockups/plain.png"],
    is_customizable: true,
    stock: 50,
    created_at: new Date().toISOString()
  },
  {
    id: "mock-2",
    title: "Premium Textured Tote",
    description: "Luxury reinforced canvas with premium finish.",
    price: 249,
    category: "Premium",
    images: ["/mockups/premium.png"],
    is_customizable: true,
    stock: 30,
    created_at: new Date().toISOString()
  }
];

// GET products (Public Route)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isFeatured = searchParams.get("featured") === "true";

    if (!isSupabaseConfigured()) {
      return process.env.NODE_ENV === "development"
        ? NextResponse.json(MOCK_PRODUCTS)
        : NextResponse.json({ error: "Supabase is required for products." }, { status: 503 });
    }

    let query = supabase
      .from('products')
      .select('*');

    if (isFeatured) {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    
    // Normalize data (handle snake_case vs camelCase if needed)
    const normalizedData = data.map((p: any) => ({
      ...p,
      _id: p.id, // For frontend compatibility
      isCustomizable: p.is_customizable
    }));

    return NextResponse.json(normalizedData);
  } catch (error: any) {
    console.error("Supabase Fetch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
