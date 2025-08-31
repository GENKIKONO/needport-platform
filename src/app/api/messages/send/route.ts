import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { pushNotification } from '@/lib/notify/notify';
import { enqueueEmail } from '@/lib/notify/email';
import { formatAnonId } from '@/lib/visibility';

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

  // 受信相手の user_id を取得（提案参加者ビューなどを使う想定）
  const { data: participants } = await sadmin
    .from('proposal_participants')
    .select('vendor_id, owner_id')
    .eq('proposal_id', parsed.data.proposalId)
    .maybeSingle();
  
  if (participants) {
    const receiverId = participants.vendor_id === userId ? participants.owner_id : participants.vendor_id;
    
    if (receiverId) {
      // 送信者の表示名（匿名ID優先）
      const senderAnon = formatAnonId(userId);

      // アプリ内通知
      await pushNotification({
        userId: receiverId,
        type: 'message',
        title: '新しいメッセージが届きました',
        body: `${senderAnon}: ${String(parsed.data.body).slice(0, 80)}`,
        meta: { proposalId: parsed.data.proposalId }
      });

      // メール（相手のメールがわかる場合のみ。なければスキップ）
      // Clerk APIや独自ユーザープロファイルにemailを持っている前提があれば取得→投入
      // ここでは vendor_profiles.email や user_identities.email を順に探す例（存在すれば）
      let toEmail: string | null = null;
      const { data: vp } = await sadmin.from('vendor_profiles').select('email').eq('user_id', receiverId).maybeSingle();
      if (vp?.email) toEmail = vp.email;
      if (toEmail) {
        await enqueueEmail({
          to: toEmail,
          toUserId: receiverId,
          subject: '【NeedPort】新着メッセージ',
          text: `新しいメッセージが届きました。\n\n送信者: ${senderAnon}\n\n内容: ${parsed.data.body}\n\n返信: https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'needport.jp'}/proposals/${parsed.data.proposalId}/chat`,
          html: `<p>新しいメッセージが届きました。</p><p><b>送信者:</b> ${senderAnon}</p><p>${String(parsed.data.body).replace(/</g,'&lt;')}</p><p><a href="https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'needport.jp'}/proposals/${parsed.data.proposalId}/chat">返信する</a></p>`,
          meta: { proposalId: parsed.data.proposalId }
        });
      }
    }
  }

  return NextResponse.json({ ok: true, id: data.id, createdAt: data.created_at });
}
