import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// 拡張: status=review/draft/published を受け付ける（管理UIで使用）
// 未指定時は published のみ返す。
// published の場合は needs_public ビューを利用して PII マスク済み値を返す。

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q')?.trim();
  const region = url.searchParams.get('region')?.trim();
  const cat = url.searchParams.get('cat')?.trim();
  const status = url.searchParams.get('status') || 'published';
  const sort = url.searchParams.get('sort') || 'new';
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
  // 上限ガード（DoS対策）
  const perRaw = Number(url.searchParams.get('per') || '12');
  const per = Number.isFinite(perRaw) ? Math.min(Math.max(perRaw, 1), 24) : 12;
  const from = (page-1)*per, to = from + per - 1;

  const sadmin = supabaseAdmin();
  let query;
  if (status === 'published') {
    // 公開ビュー（care_taxiは needs_public_v の masked フィールドを優先）
    query = sadmin.from('needs_public_v').select('id,title,summary,region,category,created_at,updated_at,deadline,status,kind,where_from_masked,where_to_masked,when_date,when_time,who_count,wheelchair,helpers_needed', { count: 'exact' });
  } else {
    // 管理用（テーブル直）
    query = sadmin.from('needs').select('id,title,summary,region,category,created_at,updated_at,deadline,status,kind,where_from,where_to,when_date,when_time,who_count,wheelchair,helpers_needed', { count: 'exact' }).eq('status', status);
  }

  if (q) query = query.ilike('title', `%${q}%`);
  if (region) query = query.ilike('region', `%${region}%`);
  if (cat) query = query.ilike('category', `%${cat}%`);

  if (sort === 'popular') query = query.order('updated_at', { ascending: false });
  else if (sort === 'deadline') query = query.order('deadline', { ascending: true }).order('updated_at', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  const { data, count, error } = await query.range(from, to);
  if (error) return NextResponse.json({ rows: [], page, per, total: 0 }, { status: 200 });
  return NextResponse.json({ rows: data ?? [], page, per, total: count ?? 0 });
}
