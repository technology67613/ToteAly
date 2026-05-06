import { NextRequest, NextResponse } from "next/server";
import * as nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    // Create transporter using SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_PORT === "465",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const senderEmail = process.env.EMAIL_USER;

    // Email to admin/brand
    await transporter.sendMail({
      from: `"Tote-ally Iconic Contact" <${senderEmail}>`,
      to: "devrajnandanpahar@gmail.com",
      replyTo: email,
      subject: `[Contact Form] ${subject}`,
      html: `
        <div style="font-family: serif; color: #900C3F; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #F5ECD7;">
          <h2 style="border-bottom: 2px solid #FF69B4; padding-bottom: 8px;">New Contact Form Submission</h2>
          <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr style="border-color: #F5ECD7;" />
          <p style="white-space: pre-wrap;">${message}</p>
          <hr style="border-color: #F5ECD7;" />
          <p style="font-size: 12px; color: #999;">Reply directly to this email to respond to ${name}.</p>
        </div>
      `,
    });

    // Auto-reply to the user
    await transporter.sendMail({
      from: `"Tote-ally Iconic" <${senderEmail}>`,
      to: email,
      subject: `We received your message, ${name}! 💌`,
      html: `
        <div style="font-family: serif; color: #900C3F; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #F5ECD7;">
          <h1 style="text-align: center;">Tote-ally Iconic</h1>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Thank you for reaching out! We've received your message and will get back to you within 24 hours.</p>
          <div style="background: #F5ECD7; padding: 15px; border-radius: 10px; margin: 16px 0;">
            <p><strong>Your Subject:</strong> ${subject}</p>
            <p style="white-space: pre-wrap;"><strong>Your Message:</strong><br/>${message}</p>
          </div>
          <p>In the meantime, feel free to browse our collection!</p>
          <p style="text-align: center; margin-top: 20px;">
            <a href="https://totealy.netlify.app/shop" style="background: #900C3F; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Shop Now</a>
          </p>
          <p>Stay iconic,<br/>The Tote-ally Iconic Team 🛍️</p>
        </div>
      `,
    });

    return NextResponse.json({ message: "Message sent successfully" });
  } catch (error: any) {
    console.error("[CONTACT API ERROR]", error);
    return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 });
  }
}
