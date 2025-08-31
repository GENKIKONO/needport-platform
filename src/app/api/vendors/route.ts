import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const slug = url.searchParams.get('slug'); // industry slug
  // vendors_directory_v をベースにしつつ、slug指定時は industry join で絞り込み
  if (!slug) {
    const { data, error } = await supabaseAdmin()
      .from('vendors_directory_v')
      .select('*')
      .limit(60);
    if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });
    return NextResponse.json({ rows: data });
  }
  // slugあり（industry_id引き→join）
  const { data: ind } = await supabaseAdmin()
    .from('industries')
    .select('id, slug, name, fee_applicable')
    .eq('slug', slug).maybeSingle();
  if (!ind) return NextResponse.json({ rows: [] });
  const { data, error } = await supabaseAdmin()
    .rpc('vendors_by_industry', { p_industry_id: ind.id }) // 事前に簡単なRPC用意しても良い。なければSQLでやってもOK
    .limit(60);
  if (error || !data) {
    // RPCが無い場合のフォールバック：手動結合
    const { data: list, error: err2 } = await supabaseAdmin()
      .from('vendor_industries')
      .select('vendor_id')
      .eq('industry_id', ind.id)
      .limit(200);
    if (err2) return NextResponse.json({ error: 'db_error' }, { status: 500 });
    const ids = (list||[]).map(r=>r.vendor_id);
    if (ids.length===0) return NextResponse.json({ rows: [] });
    const { data: dir, error: err3 } = await supabaseAdmin()
      .from('vendors_directory_v')
      .select('*').in('user_id', ids);
    if (err3) return NextResponse.json({ error: 'db_error' }, { status: 500 });
    return NextResponse.json({ rows: dir, industry: ind });
  }
  return NextResponse.json({ rows: data, industry: ind });
}
