import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. App will fall back to mock data if not configured.');
}

const isConfigured = Boolean(
  supabaseUrl && 
  supabaseUrl !== 'your_supabase_url_here' && 
  supabaseUrl.includes('supabase.co') &&
  supabaseAnonKey
);

const isAdminConfigured = Boolean(isConfigured && supabaseServiceKey);

/**
 * Helper to check if Supabase is properly configured
 */
export function isSupabaseConfigured() {
  return isConfigured;
}

export function isSupabaseAdminConfigured() {
  return isAdminConfigured;
}

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

// Admin client for server-side operations that bypass RLS
export const supabaseAdmin = isConfigured
  ? createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey)
  : null as any;
