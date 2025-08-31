import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';

const schema = z.object({
  proposalId: z.string().uuid(),
  body: z.string().min(1).max(4000)
});

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const input = await req.json().catch(()=>({}));
  const parsed = schema.safeParse(input);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_input', issues: parsed.error.issues }, { status: 400 });

  const sadmin = supabaseAdmin();

  // 参加者か確認（RLSでも弾くが、早期にエラー化）
  const { data: pp, error: e0 } = await sadmin
    .from('proposal_participants')
    .select('proposal_id, vendor_id, owner_id')
    .eq('proposal_id', parsed.data.proposalId)
    .maybeSingle();
  if (e0 || !pp) return NextResponse.json({ error: 'proposal_not_found' }, { status: 404 });
  const participant = (pp.vendor_id === userId) || (pp.owner_id === userId);
  if (!participant) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { data, error } = await sadmin.from('proposal_messages')
    .insert({ proposal_id: parsed.data.proposalId, sender_id: userId, body: parsed.data.body })
    .select('id, created_at')
    .single();
  if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });

  await sadmin.from('audit_logs').insert({
    actor_id: userId, action: 'MESSAGE_SENT', target_type: 'proposal', target_id: parsed.data.proposalId,
    meta: { messageId: data.id }
  });

  return NextResponse.json({ ok: true, id: data.id, createdAt: data.created_at });
}
