import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { image_url, image_base64 } = await request.json();

    if (!image_url && !image_base64) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    const apiKey = process.env.REMOVE_BG_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: "Remove.bg API key not configured" }, { status: 500 });
    }

    const formData = new FormData();
    formData.append("size", "auto");
    
    if (image_base64) {
      // Remove.bg accepts base64 format directly or file
      const matches = image_base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        formData.append("image_file_b64", matches[2]);
      } else {
        formData.append("image_file_b64", image_base64);
      }
    } else if (image_url) {
      formData.append("image_url", image_url);
    }

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Remove.bg Error:", errorText);
      throw new Error("Failed to remove background");
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = `data:image/png;base64,${buffer.toString('base64')}`;

    return NextResponse.json({ result: base64Image });
  } catch (error: any) {
    console.error("Remove.bg Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
