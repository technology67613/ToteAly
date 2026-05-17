import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Check for existing subscriber
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json({ duplicate: true });
    }

    await supabase.from('newsletter_subscribers').insert({
      email,
      source: 'footer',
      subscribed_at: new Date().toISOString(),
      is_active: true,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
