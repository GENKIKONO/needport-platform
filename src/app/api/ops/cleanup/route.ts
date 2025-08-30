import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST() {
  // 例: 30日以上 review のままの下書きを削除フラグに
  const s = supabaseAdmin();
  await s.rpc('cleanup_stale_entities'); // 使うならSupabase側でSQL関数を定義
  return NextResponse.json({ ok: true });
}
