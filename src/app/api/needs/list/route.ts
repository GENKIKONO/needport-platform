import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q')?.trim();
  const region = url.searchParams.get('region')?.trim();
  const cat = url.searchParams.get('cat')?.trim();
  const sort = url.searchParams.get('sort') || 'new';
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
  // 上限ガード（DoS対策）
  const perRaw = Number(url.searchParams.get('per') || '12');
  const per = Number.isFinite(perRaw) ? Math.min(Math.max(perRaw, 1), 24) : 12;
  const from = (page-1)*per, to = from + per - 1;

  let query = supabaseAdmin().from('needs')
    .select('id,title,summary,region,category,deadline,created_at,updated_at,public', { count: 'exact' })
    .eq('public', true);

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
