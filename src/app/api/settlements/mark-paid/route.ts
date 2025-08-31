import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { pushNotification } from '@/lib/notify/notify';
import { enqueueEmail } from '@/lib/notify/email';

const schema = z.object({
  id: z.string().uuid(),
});

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // 管理者判定
  const sadmin = supabaseAdmin();
  const { data: role, error: roleErr } = await sadmin
    .from('user_roles').select('role')
    .eq('user_id', userId).eq('role','admin').maybeSingle();
  if (roleErr) return NextResponse.json({ error: 'role_check_failed' }, { status: 500 });
  if (!role) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_input' }, { status: 400 });

  const { id } = parsed.data;

  // pending の銀行振込だけ paid に
  const { data: row, error: selErr } = await sadmin
    .from('project_settlements')
    .select('id, status, method')
    .eq('id', id)
    .maybeSingle();
  if (selErr) return NextResponse.json({ error: 'db_select_error' }, { status: 500 });
  if (!row) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (row.method !== 'bank_transfer') return NextResponse.json({ error: 'not_bank_transfer' }, { status: 400 });
  if (row.status !== 'pending') return NextResponse.json({ error: 'invalid_state' }, { status: 409 });

  const { data: updated, error: upErr } = await sadmin
    .from('project_settlements')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, need_id, vendor_id, final_price, fee_amount')
    .maybeSingle();
  if (upErr) return NextResponse.json({ error: 'db_update_error' }, { status: 500 });

  // 監査ログ
  await sadmin.from('audit_logs').insert({
    actor_id: userId,
    action: 'SETTLEMENT_MARK_PAID',
    target_type: 'settlement',
    target_id: id,
    meta: { method: 'bank_transfer' }
  });

  // 成約確定通知（銀行振込）
  if (updated) {
    const { data: need } = await sadmin
      .from('needs').select('owner_id,title').eq('id', updated.need_id).maybeSingle();
    const participants = [
      { user_id: updated.vendor_id, role: 'vendor' },
      { user_id: need?.owner_id, role: 'owner' }
    ].filter(Boolean) as {user_id:string, role:'vendor'|'owner'}[];
    for (const p of participants) {
      await pushNotification({
        userId: p.user_id,
        type: 'settlement',
        title: '成約が確定しました（入金反映）',
        body: `案件「${need?.title ?? ''}」の入金を反映しました。成約明細をご確認ください。`,
        meta: { settlementId: updated.id, needId: updated.need_id }
      });
      const { data: pref } = await sadmin
        .from('notification_prefs').select('email_on_settlement').eq('user_id', p.user_id).maybeSingle();
      if (pref?.email_on_settlement !== false) {
        const { data: vendorMail } = await sadmin
          .from('vendor_profiles').select('email').eq('user_id', p.user_id).maybeSingle();
        const to = vendorMail?.email || null;
        if (to) {
          await enqueueEmail({
            to,
            toUserId: p.user_id,
            subject: '【NeedPort】成約が確定しました（入金反映）',
            text: `案件「${need?.title ?? ''}」の入金が反映されました。\n成約明細: https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'needport.jp'}/admin/settlements`,
            html: `<p>案件「${need?.title ?? ''}」の入金が反映されました。</p><p><a href="https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'needport.jp'}/admin/settlements">成約明細を見る</a></p>`,
            meta: { settlementId: updated.id, needId: updated.need_id }
          });
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
}
