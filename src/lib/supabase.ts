import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export function isSupabaseConfigured() {
  return Boolean(
    supabaseUrl && 
    supabaseUrl !== 'your_supabase_url_here' && 
    supabaseUrl.includes('supabase.co') &&
    supabaseAnonKey
  );
}

export function isSupabaseAdminConfigured() {
  return Boolean(isSupabaseConfigured() && supabaseServiceKey);
}

// Client instances
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

export const supabaseAdmin = isSupabaseAdminConfigured()
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null as any;
