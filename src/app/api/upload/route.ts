import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase, isSupabaseConfigured } from "@/lib/supabase";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
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
