import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { findNgMatches, highlightHtml } from '@/lib/mod/ng';

export async function POST(req:Request){
  const { userId } = auth(); if (!userId) return NextResponse.json({ error:'unauthorized' }, { status:401 });
  const sa = supabaseAdmin();
  const { data:role } = await sa.from('user_roles').select('role').eq('user_id', userId).eq('role','admin').maybeSingle();
  if (!role) return NextResponse.json({ error:'forbidden' }, { status:403 });

  const { text } = await req.json().catch(()=>({ text:'' }));
  const { data:dict } = await sa.from('ng_words').select('pattern,is_regex,severity').eq('enabled', true);
  const matches = findNgMatches(text || '', (dict ?? []) as any);
  const html = highlightHtml(text || '', matches);
  return NextResponse.json({ matches, html });
}
