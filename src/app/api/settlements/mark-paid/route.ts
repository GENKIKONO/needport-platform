import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

async function isAdmin(userId?: string|null) {
  if (!userId) return false;
  const { data } = await supabaseAdmin().from('user_roles').select('role').eq('user_id', userId).eq('role','admin').maybeSingle();
  return !!data;
}

export async function POST(req: Request) {
  const { userId } = auth();
  if (!(await isAdmin(userId))) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  let id: string|undefined;
  const ct = req.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    const body = await req.json().catch(()=> ({}));
    id = body?.id;
  } else {
    const form = await req.formData().catch(()=> null);
    id = form?.get('id')?.toString();
  }
  if (!id) return NextResponse.json({ error: 'invalid_input' }, { status: 400 });

  const { error } = await supabaseAdmin()
    .from('project_settlements')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });

  return NextResponse.redirect(new URL('/admin/settlements', process.env.PLATFORM_ORIGIN));
}
