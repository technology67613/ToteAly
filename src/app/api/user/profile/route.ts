import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { isSupabaseAdminConfigured, isSupabaseConfigured, supabaseAdmin as supabase } from "@/lib/supabase";

export const runtime = "nodejs";

async function getProfileByEmail(email: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "Profile storage is not configured." }, { status: 503 });
    }

    const profile = await getProfileByEmail(session.user.email);
    if (!profile) {
      return NextResponse.json({
        _id: null,
        id: null,
        name: session.user.name || "",
        email: session.user.email,
        role: "user",
        phone: "",
        address: {},
      });
    }

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
    const existingProfile = await getProfileByEmail(session.user.email);
    const payload = {
      id: existingProfile?.id || crypto.randomUUID(),
      email: session.user.email,
      name: body.name || session.user.name || "",
      phone: body.phone || "",
      address: body.address || {},
      avatar_url: session.user.image || existingProfile?.avatar_url || null,
      role: existingProfile?.role || "user",
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "email" })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ _id: data.id, ...data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
