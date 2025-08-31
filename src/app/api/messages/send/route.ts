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

  // NGプリチェック
  const pv = await fetch(`${process.env.PLATFORM_ORIGIN}/api/mod/precheck`, {
    method:'POST', headers:{'content-type':'application/json','x-needport-internal':'1'},
    body: JSON.stringify({ kind:'message', text: parsed.data.body })
  }).then(r=>r.json()).catch(()=>({ level:'pass' }));
  if (pv.level === 'block') return NextResponse.json({ error:'ng_blocked' }, { status:400 });
  // 作成は status='pending' のまま（管理者承認で相手通知）

  // 変更: insert 時は status='pending'
  // 相手ユーザーへの通知は送らず、管理者宛に「審査キュー追加」の通知/メール（任意）を入れる
  const { data, error } = await sadmin.from('proposal_messages')
    .insert({ 
      proposal_id: parsed.data.proposalId, 
      sender_id: userId, 
      body: parsed.data.body,
      status: 'pending'
    })
    .select('id, created_at')
    .single();
  if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });

  await sadmin.from('audit_logs').insert({
    actor_id: userId, action: 'MESSAGE_SENT', target_type: 'proposal', target_id: parsed.data.proposalId,
    meta: { messageId: data.id, status: 'pending' }
  });

  // 承認制: 相手ユーザーへの通知は送らず、管理者宛に「審査キュー追加」の通知を送る
  // 管理者に通知（審査待ちメッセージがあることを知らせる）
  const { data: admins } = await sadmin
    .from('user_roles')
    .select('user_id')
    .eq('role', 'admin');
  
  if (admins && admins.length > 0) {
    const senderAnon = formatAnonId(userId);
    for (const admin of admins) {
      await pushNotification({
        userId: admin.user_id,
        type: 'system',
        title: 'メッセージ審査待ち',
        body: `提案 ${parsed.data.proposalId} に新しいメッセージが送信されました。`,
        meta: { proposalId: parsed.data.proposalId, messageId: data.id }
      });
    }
  }

  return NextResponse.json({ ok: true, id: data.id, createdAt: data.created_at });
}
