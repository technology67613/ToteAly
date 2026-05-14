import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Upload to Cloudinary with Background Removal Effect
    // Note: This requires the "Cloudinary AI Background Removal" add-on enabled in your dashboard.
    // If not enabled, we can use 'e_bgremoval' transformation.
    const result = await cloudinary.uploader.upload(image, {
      folder: "totealy_customizer",
      background_removal: "cloudinary_ai", // Best quality
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error: any) {
    console.error("Cloudinary BG Removal Error:", error);
    
    // Fallback: If AI add-on is missing, try a simpler transformation or return error
    return NextResponse.json({ 
      error: "Background removal failed. Please ensure the Cloudinary AI add-on is active.",
      details: error.message 
    }, { status: 500 });
  }
}
