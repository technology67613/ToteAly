import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isSupabaseAdminConfigured, isSupabaseConfigured, supabaseAdmin as supabase } from "@/lib/supabase";

export const runtime = "nodejs";


export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "Profile storage is not configured." }, { status: 503 });
    }

    const { resolveProfile } = await import("@/lib/profileResolver");
    const profile = await resolveProfile(
      session.user.email,
      session.user.name || undefined,
      session.user.image || undefined
    );

    return NextResponse.json({
      _id: profile.id,
      id: profile.id,
      name: profile.name || session.user.name || "",
      email: profile.email,
      role: profile.role || "user",
      phone: profile.phone || "",
      address: profile.address || {},
      avatar_url: profile.avatar_url,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "Profile storage is not configured." }, { status: 503 });
    }

    const body = await request.json();
    const { resolveProfile } = await import("@/lib/profileResolver");
    const profile = await resolveProfile(
      session.user.email,
      body.name || session.user.name || undefined,
      session.user.image || undefined
    );

    // Update other fields
    const { data, error } = await supabase
      .from("profiles")
      .update({
        name: body.name || profile.name || "",
        phone: body.phone || "",
        address: body.address || {},
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ _id: data.id, ...data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

