import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import type { Database } from '@/lib/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export async function createClient() {
  const client = createSupabaseClient<Database>(supabaseUrl!, supabaseAnonKey!);
  
  try {
    // Try to get the current user session from Clerk
    const { getToken } = auth();
    const token = await getToken({ template: 'supabase' });
    
    if (token) {
      // Set the auth token for Supabase RLS
      client.auth.setSession({
        access_token: token,
        refresh_token: '',
      });
    }
  } catch (error) {
    // If authentication fails, continue with anonymous client
    // This allows public operations to still work
    console.debug('[SUPABASE_SERVER] No authentication available, using anon client');
  }
  
  return client;
}

// Legacy sync version for backward compatibility
export function createClientSync() {
  return createSupabaseClient<Database>(supabaseUrl!, supabaseAnonKey!);
}

// Service role client for admin operations
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function createAdminClient() {
  if (!supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }
  return createSupabaseClient<Database>(supabaseUrl!, supabaseServiceRoleKey);
}
