import { createClient } from '@supabase/supabase-js';

export function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
return createClient(url, anon, { db: { schema: 'public' } });
}

export function getSupabaseAdminConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceRoleKey, { db: { schema: 'public' } });
}

export async function upsertProfile(id: string, data: any) {
  const supabase = getSupabaseAdminConfig();
  return supabase
    .from('profiles')
    .upsert({ id, ...data })
    .select()
    .single();
}

export async function deleteProfile(id: string) {
  const supabase = getSupabaseAdminConfig();
  return supabase
    .from('profiles')
    .delete()
    .eq('id', id);
}
