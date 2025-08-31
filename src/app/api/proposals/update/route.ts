import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { pushNotification } from '@/lib/notify/notify';
import { enqueueEmail } from '@/lib/notify/email';
import { formatAnonId } from '@/lib/visibility';

const schema = z.object({
  id: z.string().uuid(),
  status: z.enum(['withdrawn','accepted','declined'])
});

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_input' }, { status: 400 });

  const { id, status } = parsed.data;
  const sadmin = supabaseAdmin();

  // 提案者本人 or 管理者のみ更新可
  const { data: prop, error: e1 } = await sadmin.from('proposals').select('id,vendor_id').eq('id', id).maybeSingle();
  if (e1 || !prop) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const { data: role } = await sadmin.from('user_roles').select('role').eq('user_id', userId).eq('role','admin').maybeSingle();
  const isSelf = prop?.vendor_id === userId;
  const isAdmin = !!role;

  if (!isSelf && !isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { error: e2 } = await sadmin.from('proposals').update({ status }).eq('id', id);
  if (e2) return NextResponse.json({ error: 'db_error' }, { status: 500 });

  await sadmin.from('audit_logs').insert({
    actor_id: userId, action: 'PROPOSAL_STATUS_UPDATE', target_type: 'proposal', target_id: id, meta: { status }
  });

  if (status === 'accepted') {
    // 参加者（vendor / need owner）を取得
    const { data: parts } = await sadmin
      .from('proposal_participants').select('vendor_id, owner_id').eq('proposal_id', id).maybeSingle();
    
    // care_taxi の場合の追加処理
    const { data: need } = await sadmin.from('needs')
      .select('kind, user_reveal_policy')
      .eq('id', (await sadmin.from('proposals').select('need_id').eq('id', id).maybeSingle())?.data?.need_id)
      .maybeSingle();
    
    if (need?.kind === 'care_taxi' && need?.user_reveal_policy === 'accepted') {
      // care_taxi で accepted の場合：ユーザー連絡先開示可能フラグを設定
      // （messages/list で判定用）
      await sadmin.from('proposals').update({ 
        meta: { user_contact_revealed: true } 
      }).eq('id', id);
    }
    
    if (parts) {
      const vendorId = parts.vendor_id;
      const ownerId = parts.owner_id;
      
      // 送信
      for (const targetId of [vendorId, ownerId]) {
        if (!targetId) continue;
        await pushNotification({
          userId: targetId,
          type: 'proposal',
          title: '提案が承認されました',
          body: 'チャットで詳細を詰めましょう。',
          meta: { proposalId: id }
        });
        // メールはプリファレンスを尊重
        const { data: pref } = await sadmin
          .from('notification_prefs').select('email_on_proposal').eq('user_id', targetId).maybeSingle();
        if (pref?.email_on_proposal !== false) {
          // メールアドレスを取得（vendor_profilesから）
          let toEmail: string | null = null;
          const { data: vp } = await sadmin.from('vendor_profiles').select('email').eq('user_id', targetId).maybeSingle();
          if (vp?.email) toEmail = vp.email;
          if (toEmail) {
            await enqueueEmail({
              to: toEmail,
              toUserId: targetId,
              subject: '【NeedPort】提案が承認されました',
              text: `提案が承認されました。詳細はチャットでご確認ください。\n\nhttps://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'needport.jp'}/proposals/${id}/chat`,
              html: `<p>提案が承認されました。詳細はチャットでご確認ください。</p><p><a href="https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'needport.jp'}/proposals/${id}/chat">チャットを開く</a></p>`,
              meta: { proposalId: id }
            });
          }
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
}
