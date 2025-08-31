import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  pattern: z.string().min(1),
  is_regex: z.boolean().optional().default(false),
  severity: z.enum(['low','medium','high']).default('medium'),
  enabled: z.boolean().optional().default(true),
  notes: z.string().max(500).optional()
});

function forbid(){return NextResponse.json({ error:'forbidden' }, { status:403 });}

export async function GET() {
  const { userId } = auth(); if (!userId) return NextResponse.json({ error:'unauthorized' }, { status:401 });
  const sa = supabaseAdmin();
  const { data:role } = await sa.from('user_roles').select('role').eq('user_id', userId).eq('role','admin').maybeSingle();
  if (!role) return forbid();
  const { data, error } = await sa.from('ng_words').select('*').order('severity', { ascending:false }).order('pattern');
  if (error) return NextResponse.json({ error:'db_error' }, { status:500 });
  return NextResponse.json({ rows: data ?? [] });
}

export async function POST(req:Request){
  const { userId } = auth(); if (!userId) return NextResponse.json({ error:'unauthorized' }, { status:401 });
  const sa = supabaseAdmin();
  const { data:role } = await sa.from('user_roles').select('role').eq('user_id', userId).eq('role','admin').maybeSingle();
  if (!role) return forbid();
  const body = await req.json().catch(()=>({}));
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error:'invalid_input' }, { status:400 });

  const payload = { ...parsed.data, created_by:userId };
  const q = payload.id
    ? sa.from('ng_words').update({ ...payload, updated_at:new Date().toISOString() }).eq('id', payload.id).select('*').maybeSingle()
    : sa.from('ng_words').insert(payload).select('*').maybeSingle();
  const { data, error } = await q;
  if (error) return NextResponse.json({ error:'db_error' }, { status:500 });
  return NextResponse.json({ row: data });
}

export async function DELETE(req:Request){
  const { userId } = auth(); if (!userId) return NextResponse.json({ error:'unauthorized' }, { status:401 });
  const sa = supabaseAdmin();
  const { data:role } = await sa.from('user_roles').select('role').eq('user_id', userId).eq('role','admin').maybeSingle();
  if (!role) return forbid();
  const id = new URL(req.url).searchParams.get('id') || '';
  if (!id) return NextResponse.json({ error:'invalid_input' }, { status:400 });
  const { error } = await sa.from('ng_words').delete().eq('id', id);
  if (error) return NextResponse.json({ error:'db_error' }, { status:500 });
  return NextResponse.json({ ok:true });
}
