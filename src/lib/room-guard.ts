import { createClient } from '@supabase/supabase-js';

function sb(role: "anon"|"service") {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key  = role === "service"
    ? (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE)!
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, { auth: { persistSession: false }});
}

export async function ensureMemberApproved(roomId: string, userRef: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('DB_NOT_CONFIGURED');
  }

  const supa = sb("service");
  const { data, error } = await supa
    .from("room_members")
    .select("approved")
    .eq("room_id", roomId)
    .eq("user_ref", userRef)
    .single();

  if (error || !data || !data.approved) {
    throw new Error('NOT_APPROVED_MEMBER');
  }

  return data;
}

export async function ensureRole(roomId: string, userRef: string, roles: ('buyer'|'ops'|'vendor')[]) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('DB_NOT_CONFIGURED');
  }

  const supa = sb("service");
  const { data, error } = await supa
    .from("room_members")
    .select("role")
    .eq("room_id", roomId)
    .eq("user_ref", userRef)
    .in("role", roles)
    .single();

  if (error || !data) {
    throw new Error('NOT_AUTHORIZED');
  }

  return data;
}
