import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';

const schema = z.object({
  needId: z.string().uuid(),
  title: z.string().min(3).max(160),
  body: z.string().min(10).max(4000),
  estimatePrice: z.number().int().min(0).optional()
});

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_input', issues: parsed.error.issues }, { status: 400 });

  const { needId, title, body: b, estimatePrice } = parsed.data;

  // need が published か review かの確認（少なくとも draft には提案しない）
  const sadmin = supabaseAdmin();
  const { data: need, error: needErr } = await sadmin.from('needs').select('id,status').eq('id', needId).maybeSingle();
  if (needErr || !need) return NextResponse.json({ error: 'need_not_found' }, { status: 404 });
  if (!['published','review'].includes(need.status)) return NextResponse.json({ error: 'need_not_accepting' }, { status: 400 });

  const { data, error } = await sadmin.from('proposals')
    .insert({
      need_id: needId,
      vendor_id: userId,
      title,
      body: b,
      estimate_price: estimatePrice ?? null,
      status: 'sent'
    })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });

  await sadmin.from('audit_logs').insert({
    actor_id: userId, action: 'PROPOSAL_CREATED', target_type: 'proposal', target_id: data.id, meta: { needId }
  });

  return NextResponse.json({ ok: true, id: data.id });
}
