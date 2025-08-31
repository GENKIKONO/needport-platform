import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';

const schema = z.object({
  id: z.string().uuid().optional(),
  kind: z.enum(['need','message']),
  title: z.string().min(1),
  body: z.string().min(1),
  severity: z.enum(['low','medium','high']).default('medium'),
  enabled: z.boolean().default(true)
});

async function ensureAdmin(userId?:string){
  if(!userId) return false;
  const sa = supabaseAdmin();
  const { data } = await sa.from('user_roles').select('role').eq('user_id', userId).eq('role','admin').maybeSingle();
  return !!data;
}

export async function GET() {
  const { userId } = auth(); if(!await ensureAdmin(userId)) return NextResponse.json({error:'forbidden'},{status:403});
  const { data, error } = await supabaseAdmin().from('approval_reason_templates').select('*').order('kind').order('severity').order('title');
  if(error) return NextResponse.json({error:'db_error'},{status:500});
  return NextResponse.json({ rows: data ?? [] });
}

export async function POST(req:Request){
  const { userId } = auth(); if(!await ensureAdmin(userId)) return NextResponse.json({error:'forbidden'},{status:403});
  const body = await req.json().catch(()=>({}));
  const parsed = schema.safeParse(body);
  if(!parsed.success) return NextResponse.json({error:'invalid_input'},{status:400});
  const sa = supabaseAdmin();
  const payload = { ...parsed.data, created_by: userId };
  const q = payload.id
    ? sa.from('approval_reason_templates').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', payload.id).select('*').maybeSingle()
    : sa.from('approval_reason_templates').insert(payload).select('*').maybeSingle();
  const { data, error } = await q;
  if(error) return NextResponse.json({error:'db_error'},{status:500});
  return NextResponse.json({ row: data });
}

export async function DELETE(req:Request){
  const { userId } = auth(); if(!await ensureAdmin(userId)) return NextResponse.json({error:'forbidden'},{status:403});
  const id = new URL(req.url).searchParams.get('id') || '';
  if(!id) return NextResponse.json({error:'invalid_input'},{status:400});
  const { error } = await supabaseAdmin().from('approval_reason_templates').delete().eq('id', id);
  if(error) return NextResponse.json({error:'db_error'},{status:500});
  return NextResponse.json({ ok:true });
}
