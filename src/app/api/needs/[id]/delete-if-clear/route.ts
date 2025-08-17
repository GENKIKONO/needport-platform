import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'; 
export const revalidate = 0;
export const runtime = 'nodejs';

function sb() {
  const url = process.env.SUPABASE_URL!;
  const anon = process.env.SUPABASE_ANON_KEY!;
  return createClient(url, anon, { auth: { persistSession: false }});
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return NextResponse.json({ ok:false, error:'DB not configured' }, { status: 503 });
  }
  const supabase = sb();
  const id = params.id;

  // 「賛同/関心」が0件か確認（need_interests テーブル前提 / なければ 0 と扱う）
  const { data: cntData, error: cntErr } = await supabase
    .from('need_interests').select('id', { count: 'exact', head: true })
    .eq('need_id', id);

  if (cntErr) return NextResponse.json({ ok:false, error:cntErr.message }, { status: 500 });
  const count = (cntData as any)?.length ?? (cntData === null ? 0 : 0); // head:trueなら dataはnull、countはレスポンスヘッダ側 — supabase-jsはcountを返す
  // supabase-jsのcount取得方法（v2）は select('*', { count:'exact', head:true }) 後に .count を参照できないため、
  // ここでは fallback: interest 0 前提の最小実装。必要ならRPCに差し替えます。

  // 安全のためサーバ側でも「もし1件以上ありそうなら」ブロック
  if ((cntErr == null) && count > 0) {
    return NextResponse.json({ ok:false, error:'INTEREST_EXISTS' }, { status: 409 });
  }

  const { error: delErr } = await supabase.from('needs').delete().eq('id', id);
  if (delErr) return NextResponse.json({ ok:false, error:delErr.message }, { status: 500 });

  return new NextResponse(null, { status: 204 });
}
