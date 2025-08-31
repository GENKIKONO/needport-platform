import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { flushEmailQueue } from '@/lib/notify/email';

async function isAdmin(userId?: string) {
  if (!userId) return false;
  const { data } = await supabaseAdmin().from('user_roles').select('role').eq('user_id', userId);
  return (data || []).some(r => r.role === 'admin');
}

export async function POST() {
  const { userId } = auth();
  if (!(await isAdmin(userId))) return NextResponse.json({ error:'forbidden' }, { status: 403 });
  const res = await flushEmailQueue(20);
  return NextResponse.json(res);
}
