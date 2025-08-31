import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';

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

  const { error: upErr } = await sadmin
    .from('project_settlements')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', id);
  if (upErr) return NextResponse.json({ error: 'db_update_error' }, { status: 500 });

  // 監査ログ
  await sadmin.from('audit_logs').insert({
    actor_id: userId,
    action: 'SETTLEMENT_MARK_PAID',
    target_type: 'settlement',
    target_id: id,
    meta: { method: 'bank_transfer' }
  });

  return NextResponse.json({ ok: true });
}
