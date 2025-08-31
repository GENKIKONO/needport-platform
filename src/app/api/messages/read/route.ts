import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';

const schema = z.object({
  proposalId: z.string().uuid(),
  messageIds: z.array(z.string().uuid()).min(1)
});

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const input = await req.json().catch(()=>({}));
  const parsed = schema.safeParse(input);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_input' }, { status: 400 });

  const sadmin = supabaseAdmin();

  // 参加者か軽く確認（RLSでも制限）
  const { data: pp } = await sadmin.from('proposal_participants').select('proposal_id,vendor_id,owner_id').eq('proposal_id', parsed.data.proposalId).maybeSingle();
  if (!pp) return NextResponse.json({ error: 'proposal_not_found' }, { status: 404 });

  // read_by に userId を追加（idごと）
  const updates = await Promise.all(parsed.data.messageIds.map(async id => {
    const { data: msg } = await sadmin.from('proposal_messages').select('read_by').eq('id', id).maybeSingle();
    if (!msg) return null;
    const arr = Array.isArray(msg.read_by) ? msg.read_by : [];
    if (arr.includes(userId)) return null;
    const { error } = await sadmin.from('proposal_messages').update({ read_by: [...arr, userId] }).eq('id', id);
    if (error) throw error;
    return id;
  }));

  await sadmin.from('audit_logs').insert({
    actor_id: userId, action: 'MESSAGE_READ', target_type: 'proposal', target_id: parsed.data.proposalId,
    meta: { messageIds: parsed.data.messageIds }
  });

  return NextResponse.json({ ok: true, updated: updates.filter(Boolean) });
}
