import { NextRequest, NextResponse } from "next/server";
import { sendNewsletterNotificationEmail } from "@/lib/email";
import { isSupabaseAdminConfigured, isSupabaseConfigured, supabaseAdmin as supabase } from "@/lib/supabase";

export const runtime = "nodejs";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  let normalizedEmail = "";

  try {
    const { email } = await request.json();
    normalizedEmail = String(email || "").trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
      console.warn("Newsletter signup received in mock mode:", normalizedEmail);
      await sendNewsletterNotificationEmail(normalizedEmail);
      return NextResponse.json({ message: "You are on the list." }, { status: 202 });
    }

    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert(
        { email: normalizedEmail, source: "footer", subscribed_at: new Date().toISOString() },
        { onConflict: "email" }
      );

    if (error) throw error;

    await sendNewsletterNotificationEmail(normalizedEmail);

    return NextResponse.json({ message: "You are on the list." });
  } catch (error: any) {
    console.error("Newsletter signup error:", error);
    try {
      if (isValidEmail(normalizedEmail)) {
        await sendNewsletterNotificationEmail(normalizedEmail);
      }
    } catch (notifyError) {
      console.error("Newsletter fallback notification error:", notifyError);
    }
    return NextResponse.json(
      { message: "You are on the list.", mode: "fallback" },
      { status: 202 }
    );
  }
}
