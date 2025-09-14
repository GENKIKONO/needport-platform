import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { createAdminClientOrNull } from "@/lib/supabase/admin";
import { pushNotification } from '@/lib/notify/notify';


// Force dynamic rendering to avoid build-time env access
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

const schema = z.object({
  messageId: z.string().uuid(),
  action: z.enum(['approve','reject'])
});

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // 管理者判定
  const { data: role } = await admin
    .from('user_roles').select('role').eq('user_id', userId).eq('role','admin').maybeSingle();
  if (!role) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  const { messageId, action } = parsed.data;

  const status = action === 'approve' ? 'approved' : 'rejected';

  const { data: msg, error: ge } = await admin
    .from('proposal_messages')
    .select('id, proposal_id, sender_id, body, created_at')
    .eq('id', messageId)
    .maybeSingle();
  if (ge || !msg) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const { error: ue } = await admin
    .from('proposal_messages')
    .update({ status })
    .eq('id', messageId);
  if (ue) return NextResponse.json({ error: 'update_failed' }, { status: 500 });

  // 承認時のみ、相手に「新着メッセージ」を通知（ここで初めて届く）
  if (status === 'approved') {
    // 提案の相手（vendor/need owner）を求める（既存の participants 取得ヘルパーに合わせて実装）
    const { data: prop } = await admin
      .from('proposals')
      .select('vendor_id, need_id')
      .eq('id', msg.proposal_id)
      .maybeSingle();

    if (prop) {
      // need owner を取得（needs.owner_id などの現行スキーマに合わせる）
      const { data: need } = await admin
        .from('needs').select('owner_id').eq('id', prop.need_id).maybeSingle();

      const recipient = (msg.sender_id === prop.vendor_id) ? (need?.owner_id || null) : prop.vendor_id;
      if (recipient) {
        await pushNotification({
          userId: recipient,
          type: 'message',
          title: '新着メッセージが届きました',
          body: '承認済みメッセージを確認できます。',
          meta: { proposalId: msg.proposal_id }
        });
      }
    }
  }

  return NextResponse.json({ ok: true, status });
}
