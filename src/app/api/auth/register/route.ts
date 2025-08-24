import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE } from "@/lib/simpleSession";

export const dynamic = "force-dynamic";

const RegisterSchema = z.object({
  name: z.string().min(2, "氏名は2文字以上"),
  email: z.string().email("メール形式が不正です"),
  password: z.string().min(8, "8文字以上のパスワード"),
  agree: z.boolean().refine(v => v, "規約への同意が必要です"),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = RegisterSchema.parse(json);

    // 本番では DB に作成。ここでは Cookie セッションを書くだけ
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, `v1:${body.email}`, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
    });
    return res;
  } catch (e: any) {
    const msg = e?.issues?.[0]?.message || "入力に誤りがあります";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
