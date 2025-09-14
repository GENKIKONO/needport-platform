import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      // For build safety, return null instead of throwing during static evaluation
      if (typeof window === 'undefined' && !process.env.NODE_ENV) {
        return null as any;
      }
      throw new Error("Missing SUPABASE env for admin client");
    }
    return createClient(url, key, { auth: { persistSession: false } });
  } catch (error) {
    // Safe fallback during build time
    if (typeof window === 'undefined' && process.env.NODE_ENV !== 'development') {
      return null as any;
    }
    throw error;
  }
}

// Safe factory that returns null instead of throwing when env vars are missing
export function createAdminClientOrNull() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    return createClient(url, key, { auth: { persistSession: false } });
  } catch (error) {
    return null;
  }
}

// compat: safe named alias for import compatibility - use OrNull version for build safety
export const supabaseAdmin = createAdminClientOrNull;

// compat: default export
export default createAdminClient;
