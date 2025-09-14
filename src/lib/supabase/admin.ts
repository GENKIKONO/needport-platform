import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE env for admin client");
  return createClient(url, key, { auth: { persistSession: false } });
}

// Safe factory that returns null instead of throwing when env vars are missing
export function createAdminClientOrNull() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// compat: named alias for import compatibility
export const supabaseAdmin = createAdminClient;

// compat: default export
export default createAdminClient;
