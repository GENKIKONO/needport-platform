import { NextRequest, NextResponse } from "next/server";
import { createNeed, listPublicNeeds } from "@/lib/admin/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 簡易レート制限
async function rateLimit(req: NextRequest, key: string, limitPerMin: number = 30): Promise<boolean> {
  const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
  const minute = Math.floor(Date.now() / 60000);
  const rateKey = `rate:${key}:${ip}:${minute}`;
  
  try {
    const { kv } = await import("@vercel/kv");
    const count = await kv.incr(rateKey);
    await kv.expire(rateKey, 60); // 1分で期限切れ
    return count <= limitPerMin;
  } catch (error) {
    // KVが利用できない場合は制限なし
    return true;
  }
}

// GET /api/needs → 公開/サンプルの一覧
export async function GET() {
  const list = await listPublicNeeds();
  // isPublished=true のみを返す（サンプルは除外）
  const publishedOnly = list.filter(need => need.isPublished);
  return NextResponse.json({ items: publishedOnly });
}

// POST /api/needs → 一般ユーザの投稿
export async function POST(req: NextRequest) {
  // レート制限チェック
  const allowed = await rateLimit(req, 'needs_post', 30);
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const { title, body, estimateYen } = await req.json().catch(() => ({}));
  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }
  
  const need = await createNeed({
    title,
    body,
    estimateYen: typeof estimateYen === "number" ? estimateYen : undefined,
    ownerMasked: "ユーザ", // 将来はログインユーザ名に置換
    isPublished: false,     // 投稿直後は非公開（管理で公開にする）
    isSample: false,
  });
  return NextResponse.json(need, { status: 201 });
}
