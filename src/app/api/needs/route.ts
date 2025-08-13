export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/server/supabase';  
import { stripPII } from '@/lib/validation/need';

export async function POST(req: Request) {
  const sb = supabaseServer();
  const body = await req.json();

  const {
    title,
    summary,
    scale, // 'personal' | 'community'
    macro_fee_hint,
    macro_use_freq,
    macro_area_hint,
    agree,
  } = body ?? {};

  if (!agree) return NextResponse.json({ ok: false, error: 'agree required' }, { status: 400 });
  if (!title || !summary || (scale !== 'personal' && scale !== 'community')) {
    return NextResponse.json({ ok: false, error: 'invalid input' }, { status: 400 });
  }

  const insertData = {
    title: stripPII(title),
    summary: stripPII(summary),
    scale,
    published: false,
    adopted_offer_id: null,
    macro_fee_hint: scale === 'community' ? macro_fee_hint ?? null : null,
    macro_use_freq: scale === 'community' ? macro_use_freq ?? null : null,
    macro_area_hint: scale === 'community' ? macro_area_hint ?? null : null,
  };

  const { error } = await sb
    .from('needs')
    .insert([insertData], { returning: 'minimal' }); // ★ ここが肝

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
