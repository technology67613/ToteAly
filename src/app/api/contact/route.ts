import { NextRequest, NextResponse } from "next/server";
import { sendContactEmails } from "@/lib/email";
import { isSupabaseAdminConfigured, isSupabaseConfigured, supabaseAdmin as supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message, quantity, bagType, logoUrl } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "Contact message storage is not configured." }, { status: 503 });
    }

    const { error: dbError } = await supabase
      .from("contact_messages")
      .insert({
        name,
        email,
        subject,
        message,
        quantity: quantity ? Number(quantity) : null,
        bag_type: bagType || null,
        logo_url: logoUrl || null,
        status: "new",
      });

    if (dbError) throw dbError;

    await sendContactEmails({ name, email, subject, message });

    return NextResponse.json({ message: "Message saved and sent successfully" });
  } catch (error: any) {
    console.error("[CONTACT API ERROR]", error);
    return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 });
  }
}
