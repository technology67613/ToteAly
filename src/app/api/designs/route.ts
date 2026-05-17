import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin as supabase, isSupabaseAdminConfigured } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, previewImage, canvasData, title } = await request.json();

    // Ensure productId is a valid UUID, otherwise set to null
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validProductId = productId && uuidRegex.test(productId) ? productId : null;

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    // Get or create user profile
    let { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', session.user.email)
      .maybeSingle();

    if (!profile) {
      const { data: newProfile, error: insertError } = await supabase
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
        console.error("Failed to create profile on the fly:", insertError);
        return NextResponse.json({ error: "User profile not found and could not be created" }, { status: 404 });
      }
      profile = newProfile;
    }

    const { data, error } = await supabase
      .from('user_designs')
      .insert([{
        user_id: profile.id,
        product_id: validProductId,
        preview_image: previewImage,
        canvas_data: canvasData,
        title: title || "Untitled Design",
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("[DESIGNS API ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    let { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', session.user.email)
      .maybeSingle();

    if (!profile) {
      const { data: newProfile, error: insertError } = await supabase
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

    const { data, error } = await supabase
      .from('user_designs')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[DESIGNS API GET ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
