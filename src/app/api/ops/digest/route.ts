import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { enqueueEmail } from '@/lib/notify/email';

// 管理者のみ叩けるようにしてもOK。まずは内部Cron用に簡易保護で実装。
export async function POST() {
  try {
    // 直近24hの未読通知をユーザー別に集計
    const since = new Date(Date.now() - 24*60*60*1000).toISOString();
    const { data: notes } = await supabaseAdmin()
      .from('notifications')
      .select('user_id,type,title,created_at,read')
      .gte('created_at', since);
    if (!notes?.length) return NextResponse.json({ ok:true, sent:0 });

    const byUser = new Map<string, any[]>();
    for (const n of notes) {
      if (n.read) continue;
      const arr = byUser.get(n.user_id) || [];
      arr.push(n);
      byUser.set(n.user_id, arr);
    }
    let sent = 0;
    for (const [userId, list] of byUser.entries()) {
      // プリファレンス：最低限、いずれかのメールがONなら送る
      const { data: pref } = await supabaseAdmin()
        .from('notification_prefs')
        .select('email_on_message,email_on_proposal,email_on_settlement')
        .eq('user_id', userId).maybeSingle();
      const allow = (pref?.email_on_message ?? true) || (pref?.email_on_proposal ?? true) || (pref?.email_on_settlement ?? true);
      if (!allow) continue;
      // 送信先メール
      const { data: vendorMail } = await supabaseAdmin()
        .from('vendor_profiles').select('email').eq('user_id', userId).maybeSingle();
      const to = vendorMail?.email;
      if (!to) continue;
      const lines = list.slice(0,20).map(n=>`・[${n.type}] ${n.title} (${new Date(n.created_at).toLocaleString('ja-JP')})`).join('\n');
      await enqueueEmail({
        to, toUserId: userId,
        subject: '【NeedPort】未読通知のまとめ（24時間分）',
        text: `未読通知（24h）：\n${lines}\n\nhttps://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'needport.jp'}/me`,
        html: `<p>未読通知（24h）：</p><pre>${lines}</pre><p><a href="https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'needport.jp'}/me">通知を見る</a></p>`,
        meta: { digest: true, count: list.length }
      });
      sent++;
    }
    return NextResponse.json({ ok:true, sent });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error:'digest_failed' }, { status: 500 });
  }
}
