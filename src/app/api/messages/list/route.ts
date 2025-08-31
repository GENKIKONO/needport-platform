import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';

const qs = z.object({
  proposalId: z.string().uuid(),
  limit: z.string().optional(),
  before: z.string().optional() // ISO 時刻 or message id 後日
});

export async function GET(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const parsed = qs.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) return NextResponse.json({ error: 'invalid_query' }, { status: 400 });
  const { proposalId } = parsed.data;
  const limit = Math.min(50, Math.max(1, parseInt(parsed.data.limit || '20', 10)));

  // 既定で可視メッセージのみ
  const sadmin = supabaseAdmin();
  const isAdmin = !!(await sadmin.from('user_roles').select('role').eq('user_id', userId).eq('role','admin').maybeSingle()).data;
  
  // 表示名ポリシー判定のため、proposal と need の情報を取得
  const { data: proposal } = await sadmin.from('proposals')
    .select('need_id, vendor_id, status')
    .eq('id', proposalId)
    .maybeSingle();
  
  const { data: need } = await sadmin.from('needs')
    .select('kind, user_reveal_policy, owner_id')
    .eq('id', proposal?.need_id)
    .maybeSingle();
  
  let query = sadmin.from('proposal_messages').select('id, sender_id, body, created_at, read_by').eq('proposal_id', proposalId).order('created_at', { ascending: false }).limit(limit);
  if(!isAdmin) query = query.eq('visible', true);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });

  return NextResponse.json({ rows: (data ?? []).reverse() });
}
