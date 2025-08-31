import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error:'unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const ids: string[] = Array.isArray(body?.ids) ? body.ids.slice(0,100) : [];
  if (!ids.length) return NextResponse.json({ ok:true, updated:0 });
  const { error } = await supabaseAdmin()
    .from('notifications')
    .update({ read: true })
    .in('id', ids)
    .eq('user_id', userId);
  if (error) return NextResponse.json({ error:'db_error' }, { status: 500 });
  return NextResponse.json({ ok:true, updated: ids.length });
}
