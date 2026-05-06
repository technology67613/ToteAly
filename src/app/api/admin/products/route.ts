import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase, isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

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

// GET all products
export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return process.env.NODE_ENV === "development"
        ? NextResponse.json(MOCK_PRODUCTS)
        : NextResponse.json({ error: "Supabase is required for products." }, { status: 503 });
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is required to manage products." }, { status: 500 });
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

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

// POST new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!isSupabaseConfigured()) {
      return process.env.NODE_ENV === "development"
        ? NextResponse.json({ ...body, _id: `mock-${Date.now()}` }, { status: 201 })
        : NextResponse.json({ error: "Supabase is required to create products." }, { status: 503 });
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is required to create products." }, { status: 500 });
    }

    const { data, error } = await supabase
      .from('products')
      .insert([{
        title: body.title,
        description: body.description,
        price: body.price,
        category: body.category,
        images: body.images,
        stock: body.stock,
        is_customizable: body.isCustomizable
      }])
      .select();

    if (error) throw error;
    return NextResponse.json(data[0], { status: 201 });
  } catch (error: any) {
    console.error("Supabase POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    if (!isSupabaseConfigured()) {
      return process.env.NODE_ENV === "development"
        ? NextResponse.json({ message: `Mock: Product ${id} deleted` })
        : NextResponse.json({ error: "Supabase is required to delete products." }, { status: 503 });
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is required to delete products." }, { status: 500 });
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ message: `Product ${id} deleted` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - update product
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    if (!isSupabaseConfigured()) {
      return process.env.NODE_ENV === "development"
        ? NextResponse.json({ ...updates, id })
        : NextResponse.json({ error: "Supabase is required to update products." }, { status: 503 });
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is required to update products." }, { status: 500 });
    }

    const { data, error } = await supabase
      .from('products')
      .update({
        title: updates.title,
        description: updates.description,
        price: updates.price,
        category: updates.category,
        images: updates.images,
        stock: updates.stock,
        is_customizable: updates.isCustomizable,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return NextResponse.json(data[0]);
  } catch (error: any) {
    console.error("Supabase PATCH Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
