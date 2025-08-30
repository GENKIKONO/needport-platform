import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getOrCreateHandle, getHandle } from '@/lib/user-handle';
import { rateLimit } from '@/lib/rateLimit';
import { getAuth } from '@clerk/nextjs/server';

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

    // 開発用認証チェック
    const { getDevSession } = await import('@/lib/devAuth');
    const devSession = getDevSession();
    const userId = devSession?.userId || getAuth(req).userId;

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Rate limiting - per user per room
    const rateLimitResult = await rateLimit(req as any, {
      limit: 10, // 10 messages per minute per room
      windowMs: 60 * 1000,
      keyGenerator: (req) => `room_messages:${userId}:${roomId}:${Math.floor(Date.now() / 60000)}`,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please slow down.', retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { body: messageBody } = body || {};
    
    if (!messageBody) {
      return NextResponse.json({ error: 'body required' }, { status: 400 });
    }

    // Validate message length
    if (typeof messageBody !== 'string' || messageBody.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid message body' }, { status: 400 });
    }

    if (messageBody.length > 1000) {
      return NextResponse.json({ error: 'Message too long (max 1000 characters)' }, { status: 400 });
    }

    const userRef = await getOrCreateHandle();
    const supa = sb("service");

    // 開発用認証の場合は参加者チェックをスキップ
    if (!devSession) {
      // Check if user is a room participant with proper authorization
      const { data: participant, error: participantErr } = await supa
        .from("room_participants")
        .select("role")
        .eq("room_id", roomId)
        .eq("user_id", userId || userRef)
        .single();

      if (participantErr || !participant) {
        console.info({ action: 'messages-create', result: 'NOT_ROOM_PARTICIPANT' });
        return NextResponse.json({ error: 'You are not authorized to post in this room' }, { status: 403 });
      }
    }

    // Check if room is in active state and user has paid access
    const { data: room, error: roomErr } = await supa
      .from("rooms")
      .select(`
        status,
        need_id,
        needs!inner(id)
      `)
      .eq("id", roomId)
      .single();

    if (roomErr || !room || room.status !== 'active') {
      console.info({ action: 'messages-create', result: 'ROOM_NOT_ACTIVE' });
      return NextResponse.json({ error: 'Room is not active' }, { status: 403 });
    }

    // 開発用認証の場合は支払いチェックをスキップ
    if (!devSession) {
      // Verify user has paid access to this need/room
      const { data: paidMatch, error: paidErr } = await supa
        .from("matches")
        .select("id")
        .eq("need_id", room.need_id)
        .eq("business_id", userId || userRef)
        .eq("status", "paid")
        .limit(1);

      if (paidErr || !paidMatch || paidMatch.length === 0) {
        console.info({ action: 'messages-create', result: 'NO_PAID_ACCESS' });
        return NextResponse.json({ error: 'Payment required to access this room' }, { status: 402 });
      }
    }

    const { error } = await supa
      .from("messages")
      .insert({
        room_id: roomId,
        sender_id: userId || userRef,
        body: String(messageBody).trim().slice(0, 1000),
        created_at: new Date().toISOString()
      });

    if (error) {
      console.info({ action: 'messages-create', result: 'INSERT_ERROR', error: error.message });
      return NextResponse.json({ error: 'INSERT_ERROR' }, { status: 500 });
    }

    // 監査ログに記録
    try {
      const { auditHelpers } = await import('@/lib/audit');
      await auditHelpers.log({
        actor: userId || userRef,
        action: 'message.create',
        target: roomId,
        metadata: {
          roomId,
          messageLength: messageBody.length,
          needId: room.need_id
        }
      });
    } catch (auditError) {
      console.warn('Failed to log audit:', auditError);
    }

    console.info({ action: 'messages-create', result: 'SUCCESS' });
    return new NextResponse(null, { status: 201 });

  } catch (e) {
    console.error('messages-create error:', e);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
