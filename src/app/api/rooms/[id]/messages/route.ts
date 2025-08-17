import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getOrCreateHandle, getHandle } from '@/lib/user-handle';

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

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const roomId = params.id;
  
  try {
    // DB未設定の場合は空配列を返す
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.info({ action: 'messages-list', result: 'DB_NOT_CONFIGURED' });
      return NextResponse.json([], { status: 200 });
    }

    const supa = sb("anon");

    const { data, error } = await supa
      .from("messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.info({ action: 'messages-list', result: 'SELECT_ERROR', error: error.message });
      return NextResponse.json([], { status: 200 });
    }

    console.info({ action: 'messages-list', result: 'SUCCESS', count: data?.length || 0 });
    return NextResponse.json(data || [], { status: 200 });

  } catch (e) {
    console.error('messages-list error:', e);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const roomId = params.id;
  
  try {
    // DB未設定の場合は501を返す
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.info({ action: 'messages-create', result: 'DB_NOT_CONFIGURED' });
      return NextResponse.json({ error: 'DB_NOT_CONFIGURED' }, { status: 501 });
    }

    const body = await req.json();
    const { body: messageBody } = body || {};
    
    if (!messageBody) {
      return NextResponse.json({ error: 'body required' }, { status: 400 });
    }

    const userRef = await getOrCreateHandle();
    const supa = sb("service");

    // 承認済みメンバーかチェック
    const { data: member, error: memberErr } = await supa
      .from("room_members")
      .select("approved")
      .eq("room_id", roomId)
      .eq("user_ref", userRef)
      .single();

    if (memberErr || !member || !member.approved) {
      console.info({ action: 'messages-create', result: 'NOT_APPROVED_MEMBER' });
      return NextResponse.json({ error: 'NOT_APPROVED_MEMBER' }, { status: 403 });
    }

    const { error } = await supa
      .from("messages")
      .insert({
        room_id: roomId,
        user_ref: userRef,
        body: String(messageBody).slice(0, 1000)
      });

    if (error) {
      console.info({ action: 'messages-create', result: 'INSERT_ERROR', error: error.message });
      return NextResponse.json({ error: 'INSERT_ERROR' }, { status: 500 });
    }

    console.info({ action: 'messages-create', result: 'SUCCESS' });
    return new NextResponse(null, { status: 201 });

  } catch (e) {
    console.error('messages-create error:', e);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
