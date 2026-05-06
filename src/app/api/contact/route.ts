import { NextRequest, NextResponse } from "next/server";
import { sendContactEmails } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    await sendContactEmails({ name, email, subject, message });

    return NextResponse.json({ message: "Message sent successfully" });
  } catch (error: any) {
    console.error("[CONTACT API ERROR]", error);
    return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 });
  }
}
