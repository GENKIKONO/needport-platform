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

export async function GET(req: Request, { params }: { params: { roomId: string } }) {
  const roomId = params.roomId;
  
  try {
    // DB未設定の場合は空配列を返す
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.info({ action: 'milestones-list', result: 'DB_NOT_CONFIGURED' });
      return NextResponse.json([], { status: 200 });
    }

    const supa = sb("anon");

    const { data, error } = await supa
      .from("milestones")
      .select("*")
      .eq("room_id", roomId)
      .order("due_date", { ascending: true });

    if (error) {
      console.info({ action: 'milestones-list', result: 'SELECT_ERROR', error: error.message });
      return NextResponse.json([], { status: 200 });
    }

    console.info({ action: 'milestones-list', result: 'SUCCESS', count: data?.length || 0 });
    return NextResponse.json(data || [], { status: 200 });

  } catch (e) {
    console.error('milestones-list error:', e);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request, { params }: { params: { roomId: string } }) {
  const roomId = params.roomId;
  
  try {
    // DB未設定の場合は501を返す
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.info({ action: 'milestones-create', result: 'DB_NOT_CONFIGURED' });
      return NextResponse.json({ error: 'DB_NOT_CONFIGURED' }, { status: 501 });
    }

    const body = await req.json();
    const { title, due_date, amount_yen } = body || {};
    
    if (!title) {
      return NextResponse.json({ error: 'title required' }, { status: 400 });
    }

    const userRef = await getOrCreateHandle();
    const supa = sb("service");

    // buyer または ops かチェック
    const { data: member, error: memberErr } = await supa
      .from("room_members")
      .select("role")
      .eq("room_id", roomId)
      .eq("user_ref", userRef)
      .in("role", ["buyer", "ops"])
      .single();

    if (memberErr || !member) {
      console.info({ action: 'milestones-create', result: 'NOT_AUTHORIZED' });
      return NextResponse.json({ error: 'NOT_AUTHORIZED' }, { status: 403 });
    }

    const { data, error } = await supa
      .from("milestones")
      .insert({
        room_id: roomId,
        title,
        due_date: due_date || null,
        amount_yen: amount_yen || null,
        status: 'planned'
      })
      .select()
      .single();

    if (error) {
      console.info({ action: 'milestones-create', result: 'INSERT_ERROR', error: error.message });
      return NextResponse.json({ error: 'INSERT_ERROR' }, { status: 500 });
    }

    console.info({ action: 'milestones-create', result: 'SUCCESS', milestone_id: data.id });
    return NextResponse.json({ id: data.id }, { status: 201 });

  } catch (e) {
    console.error('milestones-create error:', e);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
