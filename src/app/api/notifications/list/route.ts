import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error:'unauthorized' }, { status: 401 });
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get('limit') || 20), 50);
  const { data, error } = await supabaseAdmin()
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return NextResponse.json({ error:'db_error' }, { status: 500 });
  return NextResponse.json({ rows: data });
}
