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

  // 参加者向け: 承認済みのみ返す
  // 承認前の自分の投稿は /api/messages/mine で返す運用に（下で追加）
  const sadmin = supabaseAdmin();
  let query = sadmin.from('v_proposal_messages_visible')
    .select('id, sender_id, body, created_at, read_by')
    .eq('proposal_id', proposalId)
    .order('created_at', { ascending: false })
    .limit(limit);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });

  return NextResponse.json({ rows: (data ?? []).reverse() });
}
