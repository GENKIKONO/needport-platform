import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function GET() {
  const client = supabaseAdmin();
  
  // Preview environment fallback - return empty array instead of crashing
  if (!client) {
    console.warn('[PREVIEW_FALLBACK]', { route: '/api/industries', reason: 'no-supabase-env' });
    return NextResponse.json({ industries: [] });
  }
  
  const { data, error } = await client
    .from('industries')
    .select('id, slug, name, fee_applicable, description, sort_order, enabled')
    .eq('enabled', true)
    .order('sort_order', { ascending: true });
    
  if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });
  return NextResponse.json({ rows: data });
}
