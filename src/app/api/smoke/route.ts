// src/app/api/smoke/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // 事故防止：本番では無効
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { ok: false, error: "Disabled in production env." },
      { status: 403 }
    );
  }

  const origin = new URL("/", req.url).origin;
  const items: { name: string; ok: boolean; detail?: string }[] = [];

  // 1) ルートのCSP/nonceチェック
  try {
    const r = await fetch(origin, { cache: "no-store" });
    const hasCSP = r.headers.has("content-security-policy");
    items.push({ name: "CSP Header", ok: hasCSP });
    
    const html = await r.text();
    const hasNonce = /nonce="[A-Za-z0-9+/=]+"/.test(html);
    items.push({ name: "nonce Attribute", ok: hasNonce });
  } catch (e: any) {
    items.push({ name: "Root Fetch", ok: false, detail: e?.message ?? String(e) });
  }

  // 2) /api/needs POST を2パターン（personal/community）
  const postNeed = async (body: object, name: string) => {
    try {
      const r = await fetch(new URL("/api/needs", origin), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(body),
      });
      const j = await r.json().catch(() => ({}));
      const ok = Boolean((j as any)?.ok === true);
      items.push({ name, ok, detail: ok ? undefined : JSON.stringify(j) });
    } catch (e: any) {
      items.push({ name, ok: false, detail: e?.message ?? String(e) });
    }
  };

  await postNeed({
    title: "Smoke: 個人",
    summary: "OK",
    scale: "personal",
    agree: true,
  }, "Personal Need POST");

  await postNeed({
    title: "Smoke: 地域",
    summary: "OK",
    scale: "community",
    macro_fee_hint: "月500円〜",
    macro_use_freq: "月1回〜",
    macro_area_hint: "高知県内",
    agree: true,
  }, "Community Need POST");

  const allPassed = items.every(item => item.ok);
  return NextResponse.json({ ok: allPassed, items }, { status: allPassed ? 200 : 500 });
}
