export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { getHandle } from '@/lib/user-handle';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userRef = url.searchParams.get('member') || (await getHandle(cookies()));

  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE } = process.env as Record<string,string|undefined>;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    return NextResponse.json({ ok: false, reason: 'db_off' }, { status: 501 });
  }
  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, { auth: { persistSession: false } });

  const { data, error } = await sb
    .from('room_members')
    .select('room_id, role, approved, rooms:room_id(id, need_id, title, created_at)')
    .eq('user_ref', userRef)
    .order('created_at', { referencedTable: 'rooms', ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rooms = (data || []).map(r => ({
    id: r.rooms?.id, need_id: r.rooms?.need_id, title: r.rooms?.title ?? '案件ルーム',
    role: r.role, approved: r.approved, created_at: r.rooms?.created_at
  })).filter(r => r.id);

  return NextResponse.json({ rooms }, { status: 200 });
}
