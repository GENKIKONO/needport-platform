import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin()
    .from('vendor_profiles')
    .select('stripe_connect_account_id, stripe_connect_ready')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });
  return NextResponse.json(data ?? {});
}
