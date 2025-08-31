import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';

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

  return NextResponse.json({ ok: true });
}
