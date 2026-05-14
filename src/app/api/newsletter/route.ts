import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { sendNewsletterNotificationEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase credentials missing in newsletter route');
      return NextResponse.json({ error: 'Database connection not configured' }, { status: 503 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { email } = await req.json();
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

    // 🚀 Send email notification to Admin
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
