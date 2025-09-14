import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export function createClient() {
  return createSupabaseClient<Database>(supabaseUrl!, supabaseAnonKey!);
}

// Service role client for admin operations
export function createAdminClient() {
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }
  return createSupabaseClient<Database>(supabaseUrl!, supabaseServiceRoleKey);
}

// Safe factory that returns null instead of throwing when env vars are missing
export function createAdminClientOrNull() {
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return null;
  }
  return createSupabaseClient<Database>(supabaseUrl!, supabaseServiceRoleKey);
}
