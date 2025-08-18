import { NextRequest, NextResponse } from "next/server";
import { createNeed, listPublicNeeds } from "@/lib/admin/store";
import { getOrCreateUserByEmail } from "@/lib/trust/store";

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
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);
  const pageSize = Math.min(Math.max(Number(searchParams.get("pageSize") ?? "10"), 1), 50);

  const list = await listPublicNeeds();
  // isPublished=true のみを返す（サンプルは除外）
  const publicOnly = list.filter(need => need.isPublished && !need.isSample);
  const total = publicOnly.length;
  const start = (page - 1) * pageSize;
  const items = publicOnly.slice(start, start + pageSize);
  
  return NextResponse.json({ items, total, page, pageSize });
}

// POST /api/needs → 一般ユーザの投稿
export async function POST(req: NextRequest) {
  // レート制限チェック
  const allowed = await rateLimit(req, 'needs_post', 30);
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const { title, body, estimateYen, ownerEmail } = await req.json().catch(() => ({}));
  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }
  
  // ユーザ作成（メールがある場合）
  let ownerUserId: string | undefined;
  if (ownerEmail && typeof ownerEmail === "string") {
    try {
      const user = await getOrCreateUserByEmail(ownerEmail);
      ownerUserId = user.id;
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  }
  
  const need = await createNeed({
    title,
    body,
    estimateYen: typeof estimateYen === "number" ? estimateYen : undefined,
    ownerMasked: "ユーザ", // 将来はログインユーザ名に置換
    isPublished: false,     // 投稿直後は非公開（管理で公開にする）
    isSample: false,
    ownerUserId,           // ユーザIDを紐付け
  });
  return NextResponse.json(need, { status: 201 });
}
