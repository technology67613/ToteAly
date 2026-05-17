import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    let { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', session.user.email)
      .maybeSingle();

    if (!profile) {
      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert([{
          id: crypto.randomUUID(),
          email: session.user.email,
          name: session.user.name || session.user.email.split('@')[0],
          updated_at: new Date().toISOString()
        }])
        .select('id')
        .single();

      if (insertError) return NextResponse.json([]);
      profile = newProfile;
    }

    const { data, error } = await supabaseAdmin
      .from("wishlist")
      .select("product_id, products(*)")
      .eq("user_id", profile.id);

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { productId } = await req.json();
    if (!productId) return NextResponse.json({ error: "Product ID required" }, { status: 400 });

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    let { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', session.user.email)
      .maybeSingle();

    if (!profile) {
      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert([{
          id: crypto.randomUUID(),
          email: session.user.email,
          name: session.user.name || session.user.email.split('@')[0],
          updated_at: new Date().toISOString()
        }])
        .select('id')
        .single();

      if (insertError) {
        return NextResponse.json({ error: "User profile not found and could not be created" }, { status: 404 });
      }
      profile = newProfile;
    }

    const { error } = await supabaseAdmin
      .from("wishlist")
      .upsert({ 
        user_id: profile.id, 
        product_id: productId 
      }, { onConflict: "user_id,product_id" });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { productId } = await req.json();
    if (!productId) return NextResponse.json({ error: "Product ID required" }, { status: 400 });

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    let { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', session.user.email)
      .maybeSingle();

    if (!profile) {
      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert([{
          id: crypto.randomUUID(),
          email: session.user.email,
          name: session.user.name || session.user.email.split('@')[0],
          updated_at: new Date().toISOString()
        }])
        .select('id')
        .single();

      if (insertError) {
        return NextResponse.json({ error: "User profile not found and could not be created" }, { status: 404 });
      }
      profile = newProfile;
    }

    const { error } = await supabaseAdmin
      .from("wishlist")
      .delete()
      .eq("user_id", profile.id)
      .eq("product_id", productId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
