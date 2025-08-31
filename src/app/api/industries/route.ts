import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  const { data, error } = await supabaseAdmin()
    .from('industries')
    .select('id, slug, name, fee_applicable, description, sort_order, enabled')
    .eq('enabled', true)
    .order('sort_order', { ascending: true });
  if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });
  return NextResponse.json({ rows: data });
}
