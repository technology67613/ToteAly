import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase, isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function productPayload(body: any) {
  return {
    title: body.title,
    description: body.description,
    price: body.price,
    category: body.category,
    images: body.images,
    stock: body.stock,
    is_customizable: body.isCustomizable ?? body.is_customizable ?? false,
    is_featured: body.isFeatured ?? body.is_featured ?? false,
  };
}

function normalizeProduct(p: any) {
  return {
    ...p,
    _id: p.id,
    isCustomizable: p.is_customizable,
    isFeatured: p.is_featured,
  };
}

// GET all products
export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase configuration is required." }, { status: 503 });
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "Unauthorized: SUPABASE_SERVICE_ROLE_KEY missing." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const normalizedData = (data || []).map(normalizeProduct);

    return NextResponse.json(normalizedData);
  } catch (error: any) {
    console.error("Supabase Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch inventory from cloud." }, { status: 500 });
  }
}

// POST new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "Supabase configuration required for cloud storage." }, { status: 503 });
    }

    const { data, error } = await supabase
      .from('products')
      .insert([productPayload(body)])
      .select();

    if (error) throw error;
    return NextResponse.json(normalizeProduct(data[0]), { status: 201 });
  } catch (error: any) {
    console.error("Supabase POST Error:", error);
    return NextResponse.json({ error: "Failed to save product to cloud." }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "Supabase configuration required." }, { status: 503 });
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ message: `Product deleted successfully from cloud.` });
  } catch (error: any) {
    console.error("Supabase DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete product from cloud." }, { status: 500 });
  }
}

// PATCH - update product
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "Supabase configuration required." }, { status: 503 });
    }

    const { data, error } = await supabase
      .from('products')
      .update({
        ...productPayload(updates),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return NextResponse.json(normalizeProduct(data[0]));
  } catch (error: any) {
    console.error("Supabase PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update product in cloud." }, { status: 500 });
  }
}
