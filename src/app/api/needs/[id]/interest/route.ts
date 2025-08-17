import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

function sb(role: "anon"|"service") {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key  = role === "service"
    ? (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE)!
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, { auth: { persistSession: false }});
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { level, area, budget } = await req.json();

    // DB未設定: デモ運用（204）で終了
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return new NextResponse(null, { status: 204 });
    }

    const handle = cookies().get("np_handle")?.value || "guest";
    const supa = sb("service");

    // ⬇️ ここを upsert に変更（同じ need_id+user_ref は上書き）
    const { error } = await supa.from("need_interests").upsert(
      { need_id: params.id, user_ref: handle, level, area, budget },
      { onConflict: "need_id,user_ref" }
    );
    if (error) throw error;

    // 集計（3回のheadクエリでOK）
    const levels = ["buy","maybe","curious"] as const;
    const counts: Record<string, number> = {};
    for (const lv of levels) {
      const { count, error: e2 } = await supa
        .from("need_interests")
        .select("*", { count: "exact", head: true })
        .eq("need_id", params.id)
        .eq("level", lv);
      if (e2) throw e2;
      counts[lv] = count ?? 0;
    }

    return NextResponse.json({ counts }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
