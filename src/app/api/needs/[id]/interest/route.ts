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
    // DB無設定なら 204 で早期終了（デモ運用）
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return new NextResponse(null, { status: 204 });
    }

    const handle = cookies().get("np_handle")?.value || "guest";
    const supa = sb("service");

    // ざっくり格納先（なければ作る）：need_interests
    await supa.from("need_interests").insert({
      need_id: params.id,
      user_ref: handle,
      level, area, budget
    });

    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
