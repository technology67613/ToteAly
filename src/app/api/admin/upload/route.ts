import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin as supabase, isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/supabase";
import { writeFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

    // 1. If Supabase is configured, upload to Supabase Storage
    if (isSupabaseConfigured()) {
      if (!isSupabaseAdminConfigured()) {
        return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is required for uploads." }, { status: 500 });
      }

      const { data, error } = await supabase.storage
        .from('totealy-assets')
        .upload(`uploads/${filename}`, buffer, {
          contentType: file.type,
          upsert: true
        });

      if (error) throw error;

      // Get Public URL
      const { data: urlData } = supabase.storage
        .from('totealy-assets')
        .getPublicUrl(`uploads/${filename}`);

      return NextResponse.json({ url: urlData.publicUrl });
    }

    if (process.env.NODE_ENV === "development") {
      const uploadPath = path.join(process.cwd(), "public", "uploads", filename);
      await writeFile(uploadPath, buffer);
      const imageUrl = `/uploads/${filename}`;
      return NextResponse.json({ url: imageUrl });
    }

    return NextResponse.json({ error: "Storage is not configured for production." }, { status: 503 });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

