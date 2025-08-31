import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

async function requireAdmin() {
  // 既存のadmin判定ヘルパーを想定
  return true; // 仮実装
}

export async function POST(req: NextRequest) {
  await requireAdmin();
  const body = await req.json().catch(()=>null);
  if (!body?.vendorId || !Array.isArray(body.industryIds)) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  // 既存を差し替え（シンプル）
  const { error: delErr } = await supabaseAdmin()
    .from('vendor_industries').delete().eq('vendor_id', body.vendorId);
  if (delErr) return NextResponse.json({ error: 'db_error' }, { status: 500 });
  const rows = body.industryIds.map((id:string)=>({ vendor_id: body.vendorId, industry_id: id }));
  if (rows.length) {
    const { error } = await supabaseAdmin().from('vendor_industries').insert(rows);
    if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
