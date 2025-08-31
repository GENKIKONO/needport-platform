import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

async function isAdmin(userId?: string|null) {
  if (!userId) return false;
  const { data } = await supabaseAdmin().from('user_roles').select('role').eq('user_id', userId).eq('role','admin').maybeSingle();
  return !!data;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mine = url.searchParams.get('mine') === '1';
  const limit = Number(url.searchParams.get('limit') ?? 200);
  const { userId } = auth();
  const admin = await isAdmin(userId);
  if (!admin && !mine) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  let q = supabaseAdmin().from('project_settlements').select('*').order('created_at', { ascending:false }).limit(Math.min(limit,200));
  if (mine && userId) q = q.eq('vendor_id', userId);

  const { data, error } = await q;
  if (error) return NextResponse.json([], { status: 200 });
  return NextResponse.json(data ?? []);
}
