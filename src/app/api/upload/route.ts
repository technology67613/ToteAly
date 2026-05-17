import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase, isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/supabase";
import { writeFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const base64Data = formData.get("base64") as string;
    const customFilename = formData.get("filename") as string;

    if (!file && !base64Data) {
      return NextResponse.json({ error: "No file or data provided" }, { status: 400 });
    }

    let buffer: Buffer;
    let filename: string;
    let contentType: string;

    if (file) {
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
      filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      contentType = file.type;
    } else {
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return NextResponse.json({ error: "Invalid base64 data" }, { status: 400 });
      }
      contentType = matches[1];
      buffer = Buffer.from(matches[2], 'base64');
      filename = customFilename || `${Date.now()}-design.png`;
    }

    // 1. If Supabase is configured, upload to Supabase Storage
    if (isSupabaseConfigured()) {
      if (!isSupabaseAdminConfigured()) {
        return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is required for uploads." }, { status: 500 });
      }

      const { data, error } = await supabase.storage
        .from('totealy-assets')
        .upload(`uploads/${filename}`, buffer, {
          contentType: contentType,
          upsert: true
        });

      if (error) throw error;

      // Get Public URL
      const { data: urlData } = supabase.storage
        .from('totealy-assets')
        .getPublicUrl(`uploads/${filename}`);

      return NextResponse.json({ url: urlData.publicUrl });
    }

    // 2. Fallback to Local Storage only in development
    if (process.env.NODE_ENV === "development") {
      const uploadPath = path.join(process.cwd(), "public", "uploads", filename);
      await writeFile(uploadPath, buffer);
      const imageUrl = `/uploads/${filename}`;
      return NextResponse.json({ url: imageUrl });
    }
    
    return NextResponse.json({ error: "Storage not configured for production" }, { status: 500 });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
