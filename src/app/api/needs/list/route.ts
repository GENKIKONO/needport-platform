import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q')?.trim();
  const region = url.searchParams.get('region')?.trim();
  const cat = url.searchParams.get('cat')?.trim();
  const sort = url.searchParams.get('sort') || 'new';

  let query = supabaseAdmin().from('needs')
    .select('id,title,summary,region,category,created_at,updated_at,public', { count: 'exact' })
    .eq('public', true);

  if (q) query = query.ilike('title', `%${q}%`);
  if (region) query = query.ilike('region', `%${region}%`);
  if (cat) query = query.ilike('category', `%${cat}%`);

  if (sort === 'popular') query = query.order('updated_at', { ascending: false });
  else if (sort === 'deadline') query = query.order('deadline', { ascending: true }).order('updated_at', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  const { data, error } = await query.limit(60);
  if (error) return NextResponse.json([], { status: 200 });
  return NextResponse.json(data ?? []);
}
