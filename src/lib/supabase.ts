import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Configuration flags
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

// Client instances
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

export const supabaseAdmin = isAdminConfigured
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null as any;
