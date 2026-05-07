import { NextRequest, NextResponse } from "next/server";
import { sendNewsletterNotificationEmail } from "@/lib/email";
import { isSupabaseAdminConfigured, isSupabaseConfigured, supabaseAdmin as supabase } from "@/lib/supabase";
import { NewsletterSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = NewsletterSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: "Invalid email address", 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const { email } = validation.data;
    const normalizedEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "Newsletter storage is not configured." }, { status: 503 });
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
    return NextResponse.json({ error: "Newsletter signup could not be saved." }, { status: 500 });
  }
}
