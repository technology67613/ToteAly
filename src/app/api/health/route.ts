import { NextResponse } from "next/server";
import { isSupabaseConfigured, isSupabaseAdminConfigured } from "@/lib/supabase";

export async function GET() {
  const status = {
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      supabase: isSupabaseConfigured() ? "connected" : "missing",
      supabaseAdmin: isSupabaseAdminConfigured() ? "connected" : "missing",
      smtp: {
        host: !!process.env.EMAIL_HOST,
        user: !!process.env.EMAIL_USER,
      },
      shiprocket: {
        email: !!process.env.SHIPROCKET_EMAIL,
      },
      razorpay: {
        key: !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      }
    }
  };

  return NextResponse.json(status);
}
