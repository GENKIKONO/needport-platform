import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { getHandle } from '@/lib/user-handle';

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

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const offerId = params.id;
  
  try {
    // DB未設定の場合は501を返す
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.info({ action: 'offer-accept', result: 'DB_NOT_CONFIGURED' });
      return NextResponse.json({ error: 'DB_NOT_CONFIGURED' }, { status: 501 });
    }

    // 所有者ハンドルを取得
    const handle = await getHandle();
    if (!handle) {
      console.info({ action: 'offer-accept', result: 'NO_HANDLE' });
      return NextResponse.json({ error: 'NO_HANDLE' }, { status: 403 });
    }

    const supa = sb("service");

    // 提案を取得
    const { data: offer, error: offerErr } = await supa
      .from("offers")
      .select("*, needs!inner(owner_ref, user_ref, title)")
      .eq("id", offerId)
      .single();

    if (offerErr || !offer) {
      console.info({ action: 'offer-accept', result: 'OFFER_NOT_FOUND' });
      return NextResponse.json({ error: 'OFFER_NOT_FOUND' }, { status: 404 });
    }

    // 所有者チェック（needsテーブルのowner_refまたはuser_refと照合）
    const isOwner = offer.needs.owner_ref === handle || offer.needs.user_ref === handle;
    if (!isOwner) {
      console.info({ action: 'offer-accept', result: 'NOT_OWNER' });
      return NextResponse.json({ error: 'NOT_OWNER' }, { status: 403 });
    }

    // 既に承認済みかチェック
    if (offer.status === 'accepted') {
      console.info({ action: 'offer-accept', result: 'ALREADY_ACCEPTED' });
      return NextResponse.json({ error: 'ALREADY_ACCEPTED' }, { status: 409 });
    }

    // トランザクション相当の処理
    // 1) 提案を承認済みに更新
    const { error: updateErr } = await supa
      .from("offers")
      .update({ status: 'accepted' })
      .eq("id", offerId);

    if (updateErr) {
      console.info({ action: 'offer-accept', result: 'UPDATE_ERROR', error: updateErr.message });
      return NextResponse.json({ error: 'UPDATE_ERROR' }, { status: 500 });
    }

    // 2) ルームを作成
    const { data: room, error: roomErr } = await supa
      .from("rooms")
      .insert({
        need_id: offer.need_id,
        offer_id: offerId,
        title: `案件ルーム: ${offer.needs.title}`
      })
      .select()
      .single();

    if (roomErr) {
      console.info({ action: 'offer-accept', result: 'ROOM_CREATE_ERROR', error: roomErr.message });
      return NextResponse.json({ error: 'ROOM_CREATE_ERROR' }, { status: 500 });
    }

    // 3) ルームメンバーを追加
    const opsHandle = process.env.ADMIN_OPS_HANDLE || 'ops';
    const members = [
      { room_id: room.id, user_ref: handle, role: 'buyer', approved: true },
      { room_id: room.id, user_ref: offer.provider_handle, role: 'vendor', approved: true },
      { room_id: room.id, user_ref: opsHandle, role: 'ops', approved: true }
    ];

    const { error: membersErr } = await supa
      .from("room_members")
      .insert(members);

    if (membersErr) {
      console.info({ action: 'offer-accept', result: 'MEMBERS_CREATE_ERROR', error: membersErr.message });
      return NextResponse.json({ error: 'MEMBERS_CREATE_ERROR' }, { status: 500 });
    }

    console.info({ action: 'offer-accept', result: 'SUCCESS', room_id: room.id });
    return NextResponse.json({ room_id: room.id }, { status: 201 });

  } catch (e) {
    console.error('offer-accept error:', e);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
