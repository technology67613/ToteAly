import { NextRequest, NextResponse } from "next/server";
import { sendContactEmails } from "@/lib/email";
import { isSupabaseAdminConfigured, isSupabaseConfigured, supabaseAdmin as supabase } from "@/lib/supabase";
import { ContactSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const { success } = rateLimit(ip, 5, 3600000); // 5 messages per hour per IP

    if (!success) {
      return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const validation = ContactSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: "Invalid request data", 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const { name, email, subject, message, quantity, bagType, logoUrl } = validation.data;

    // Try to save to DB, but don't fail if DB isn't configured
    if (isSupabaseConfigured() && isSupabaseAdminConfigured()) {
      try {
        const { data, error: insertError } = await supabase
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
          })
          .select("id")
          .single();

        if (insertError) throw insertError;

        if (data?.id) {
          // Send notification to Admin Priority Alerts
          const { error: notifError } = await supabase
            .from("admin_notifications")
            .insert({
              type: "inquiry",
              title: "New Inquiry Received",
              message: `${name} (${email}) - ${subject}`,
              reference_id: data.id,
              is_read: false
            });

          if (notifError) {
            console.warn("[CONTACT API] Failed to insert admin notification:", notifError.message);
          }
        }
      } catch (dbError) {
        // Log but don't block email sending
        console.warn("[CONTACT API] DB insert/notification failed, continuing with email:", dbError);
      }
    }

    // Always attempt to send email
    await sendContactEmails({ name, email, subject, message });

    return NextResponse.json({ message: "Message sent successfully" });
  } catch (error: any) {
    console.error("[CONTACT API ERROR]", error);
    return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 });
  }
}
