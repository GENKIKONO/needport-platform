import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getOrCreateHandle } from '@/lib/user-handle';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

function sb(role: "anon"|"service") {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key  = role === "service"
    ? (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE)!
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, { auth: { persistSession: false }});
}

export async function POST(req: Request) {
  try {
    // DB未設定の場合は501を返す
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.info({ action: 'offers-create', result: 'DB_NOT_CONFIGURED' });
      return NextResponse.json({ error: 'DB_NOT_CONFIGURED' }, { status: 501 });
    }

    const body = await req.json();
    const { need_id, price_yen, memo } = body || {};
    
    if (!need_id) {
      return NextResponse.json({ error: 'need_id required' }, { status: 400 });
    }

    const provider = await getOrCreateHandle();
    const supa = sb("service");

    const { data, error } = await supa
      .from("offers")
      .insert({ 
        need_id, 
        provider_handle: provider, 
        price_yen: price_yen || null, 
        memo: memo || null,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.info({ action: 'offers-create', result: 'INSERT_ERROR', error: error.message });
      return NextResponse.json({ error: 'INSERT_ERROR' }, { status: 500 });
    }

    console.info({ action: 'offers-create', result: 'SUCCESS', offer_id: data.id });
    return NextResponse.json({ id: data.id }, { status: 201 });

  } catch (e) {
    console.error('offers-create error:', e);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const need_id = searchParams.get('need_id');

    if (!need_id) {
      return NextResponse.json({ error: 'need_id required' }, { status: 400 });
    }

    // DB未設定の場合は空配列を返す
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.info({ action: 'offers-list', result: 'DB_NOT_CONFIGURED' });
      return NextResponse.json([], { status: 200 });
    }

    const supa = sb("anon");

    const { data, error } = await supa
      .from("offers")
      .select("*")
      .eq("need_id", need_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.info({ action: 'offers-list', result: 'SELECT_ERROR', error: error.message });
      return NextResponse.json([], { status: 200 });
    }

    console.info({ action: 'offers-list', result: 'SUCCESS', count: data?.length || 0 });
    return NextResponse.json(data || [], { status: 200 });

  } catch (e) {
    console.error('offers-list error:', e);
    return NextResponse.json([], { status: 200 });
  }
}
