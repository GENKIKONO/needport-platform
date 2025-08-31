import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';

const schema = z.object({
  email_on_message: z.boolean().optional(),
  email_on_proposal: z.boolean().optional(),
  email_on_settlement: z.boolean().optional(),
});

export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error:'unauthorized' }, { status: 401 });
  const { data } = await supabaseAdmin()
    .from('notification_prefs').select('*').eq('user_id', userId).maybeSingle();
  return NextResponse.json(data ?? { user_id:userId, email_on_message:true, email_on_proposal:true, email_on_settlement:true });
}

export async function PUT(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error:'unauthorized' }, { status: 401 });
  const body = await req.json().catch(()=> ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error:'invalid_input' }, { status: 400 });
  const patch = { ...parsed.data, updated_at: new Date().toISOString() };
  const { error } = await supabaseAdmin()
    .from('notification_prefs')
    .upsert({ user_id:userId, ...patch }, { onConflict:'user_id' });
  if (error) return NextResponse.json({ error:'db_error' }, { status: 500 });
  return NextResponse.json({ ok:true });
}
