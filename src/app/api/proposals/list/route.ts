import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';

const querySchema = z.object({
  needId: z.string().uuid().optional(),
  mine: z.string().optional(), // '1'
  page: z.string().optional(),
  per: z.string().optional()
});

export async function GET(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) return NextResponse.json({ error: 'invalid_query' }, { status: 400 });

  const q = parsed.data;
  const page = Math.max(1, parseInt(q.page || '1', 10));
  const per = Math.min(24, Math.max(1, parseInt(q.per || '12', 10)));
  const offset = (page - 1) * per;

  const sadmin = supabaseAdmin();

  // 管理者判定
  const { data: role } = await sadmin.from('user_roles').select('role').eq('user_id', userId).eq('role','admin').maybeSingle();
  const isAdmin = !!role;

  let query = sadmin.from('proposals').select('id,need_id,vendor_id,title,body,estimate_price,status,created_at,updated_at',{ count:'exact' });

  if (q.needId) query = query.eq('need_id', q.needId);
  if (!isAdmin) query = query.eq('vendor_id', userId); // 一般は自分の提案のみ
  if (q.mine === '1') query = query.eq('vendor_id', userId);

  query = query.order('created_at', { ascending: false }).range(offset, offset + per - 1);
  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });

  return NextResponse.json({ rows: data ?? [], total: count ?? 0, page, per });
}
