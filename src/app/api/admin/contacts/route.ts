import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClientOrNull } from "@/lib/supabase/admin";


// Force dynamic rendering to avoid build-time env access
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

async function isAdmin(userId?: string|null) {
  if (!userId) return false;
  const { data, error } = await supabaseAdmin()
    .from('user_roles').select('role').eq('user_id', userId);
  if (error) return false;
  return data?.some(r => r.role === 'admin');
}

export async function GET() {
  const { userId } = auth();
  if (!(await isAdmin(userId))) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { data, error } = await supabaseAdmin()
    .from('contact_messages')
    .select('id, email, name, subject, body, created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });
  return NextResponse.json(data ?? []);
}
