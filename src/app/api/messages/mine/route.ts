import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const proposalId = searchParams.get('proposalId') || '';

  // 自分が送ったメッセージは status問わず取得（RLS: Sender can read own messages）
  const { data, error } = await supabaseAdmin()
    .from('proposal_messages')
    .select('*')
    .eq('proposal_id', proposalId)
    .eq('sender_id', userId)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });
  return NextResponse.json({ rows: data ?? [] });
}
