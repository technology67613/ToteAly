import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase, isSupabaseAdminConfigured } from '@/lib/supabase';
import { sendNewsletterNotificationEmail } from '@/lib/email';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: 'Database connection not configured' }, { status: 503 });
    }

    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const { success } = rateLimit(ip, 3, 3600000); // 3 attempts per hour

    if (!success) {
      return NextResponse.json({ error: 'Too many subscription attempts. Please try later.' }, { status: 429 });
    }

    const body = await req.json();
    const email = body?.email;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: cleanEmail });

    if (error) {
      console.error('Supabase newsletter insert error:', error);
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Already subscribed!' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send email notification to Admin
    try {
      await sendNewsletterNotificationEmail(cleanEmail);
    } catch (emailErr) {
      console.warn('Newsletter email notification failed but user was subscribed:', emailErr);
    }

    return NextResponse.json({ 
      success: true, 
      message: "You're in! Welcome to the iconic club. 🎉" 
    });
  } catch (e) {
    console.error('Newsletter server error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
