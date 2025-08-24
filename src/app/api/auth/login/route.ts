import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE } from "@/lib/simpleSession";

export const dynamic = "force-dynamic";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = LoginSchema.parse(json);

    // 本番では DB 照合。ここでは常に通す（PW長さのみチェック済み）
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, `v1:${body.email}`, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: "認証に失敗しました" }, { status: 400 });
  }
}
