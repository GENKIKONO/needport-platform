import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

function sb(role: "anon"|"service") {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key  = role === "service"
    ? (process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY)!
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, { auth: { persistSession: false }});
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const needId = params.id;
  
  try {
    // DB未設定の場合は501を返す
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.info({ need_id: needId, action: 'delete-if-clear', result: 'DB_NOT_CONFIGURED' });
      return NextResponse.json({ error: 'DB_NOT_CONFIGURED' }, { status: 501 });
    }

    // 所有者ハンドルを取得
    const handle = cookies().get("np_user")?.value;
    if (!handle) {
      console.info({ need_id: needId, action: 'delete-if-clear', result: 'NO_HANDLE' });
      return NextResponse.json({ error: 'NO_HANDLE' }, { status: 403 });
    }

    const supa = sb("service");

    // 所有者チェック（needsテーブルのowner_refまたはuser_refと照合）
    const { data: need, error: needErr } = await supa
      .from("needs")
      .select("owner_ref, user_ref")
      .eq("id", needId)
      .single();

    if (needErr || !need) {
      console.info({ need_id: needId, action: 'delete-if-clear', result: 'NEED_NOT_FOUND' });
      return NextResponse.json({ error: 'NEED_NOT_FOUND' }, { status: 404 });
    }

    // 所有者チェック（owner_ref または user_ref のいずれかと一致）
    const isOwner = need.owner_ref === handle || need.user_ref === handle;
    if (!isOwner) {
      console.info({ need_id: needId, owner_ref: handle, action: 'delete-if-clear', result: 'NOT_OWNER' });
      return NextResponse.json({ error: 'NOT_OWNER' }, { status: 403 });
    }

    // 賛同件数をチェック（need_interestsテーブルから集計）
    const { count, error: countErr } = await supa
      .from("need_interests")
      .select("*", { count: "exact", head: true })
      .eq("need_id", needId);

    if (countErr) {
      console.info({ need_id: needId, action: 'delete-if-clear', result: 'COUNT_ERROR', error: countErr.message });
      return NextResponse.json({ error: 'COUNT_ERROR' }, { status: 500 });
    }

    const interestCount = count ?? 0;

    // 賛同者がいる場合は削除不可
    if (interestCount > 0) {
      console.info({ need_id: needId, interest_count: interestCount, action: 'delete-if-clear', result: 'HAS_INTERESTS' });
      return NextResponse.json({ error: 'HAS_INTERESTS', count: interestCount }, { status: 409 });
    }

    // 賛同0件なので削除実行
    const { error: deleteErr } = await supa
      .from("needs")
      .delete()
      .eq("id", needId);

    if (deleteErr) {
      console.info({ need_id: needId, action: 'delete-if-clear', result: 'DELETE_ERROR', error: deleteErr.message });
      return NextResponse.json({ error: 'DELETE_ERROR' }, { status: 500 });
    }

    console.info({ need_id: needId, action: 'delete-if-clear', result: 'SUCCESS' });
    return new NextResponse(null, { status: 204 });

  } catch (e) {
    console.error('delete-if-clear error:', e);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
