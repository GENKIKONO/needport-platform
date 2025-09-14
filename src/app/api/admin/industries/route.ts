import { NextRequest, NextResponse } from 'next/server';
import { createAdminClientOrNull } from "@/lib/supabase/admin";


// Force dynamic rendering to avoid build-time env access
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

async function requireAdmin() {
  // 既存のadmin判定ヘルパーを想定
  // 簡易実装：auth() で userId を取得して user_roles で admin チェック
  return true; // 仮実装
}

export async function GET() {
  const { data, error } = await admin
    .from('industries')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });
  return NextResponse.json({ rows: data });
}

export async function POST(req: NextRequest) {
  await requireAdmin();
  const body = await req.json().catch(()=>null);
  if (!body) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const { id, slug, name, fee_applicable=true, description, sort_order=100, enabled=true } = body;
  if (id) {
    const { error } = await admin.from('industries').update({
      slug, name, fee_applicable, description, sort_order, enabled
    }).eq('id', id);
    if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });
  } else {
    const { error } = await admin.from('industries').insert({
      slug, name, fee_applicable, description, sort_order, enabled
    });
    if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  await requireAdmin();
  const body = await req.json().catch(()=>null);
  if (!body?.id) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const { error } = await admin.from('industries').delete().eq('id', body.id);
  if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
