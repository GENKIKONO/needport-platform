import { NextRequest, NextResponse } from "next/server";
import { createNeed, listPublicNeeds } from "@/lib/admin/store";
import { getOrCreateUserByEmail } from "@/lib/trust/store";
import { getFlags } from "@/lib/admin/flags";
import { randomUUID } from "crypto";
import { NeedSchema } from "@/lib/validation/needExtended";
import { getDevSession } from "@/lib/devAuth";

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
  
  // 検索・フィルタ・ソートパラメータ
  const q = searchParams.get("q") ?? undefined;
  const stage = searchParams.get("stage") ?? undefined;
  const sort = searchParams.get("sort") as "updated" | "views" | "supporters" | "proposals" | undefined ?? "updated";
  const direction = searchParams.get("direction") as "desc" | "asc" | undefined ?? "desc";

  const list = await listPublicNeeds();
  const flags = await getFlags();
  
  // 基本フィルタ: 公開ON & サンプル制御
  let items = list.filter(need => {
    if (!need.isPublished) return false;
    if (!flags.sampleVisible && need.isSample) return false;
    return true;
  });
  
  // キーワード検索
  if (q) {
    const query = q.toLowerCase();
    items = items.filter(need => 
      (need.title?.toLowerCase().includes(query) || 
       need.body?.toLowerCase().includes(query))
    );
  }
  
  // ステージフィルタ
  if (stage) {
    items = items.filter(need => need.stage === stage);
  }
  
  // ソート
  items.sort((a, b) => {
    let aVal: any, bVal: any;
    
    switch (sort) {
      case "views":
        aVal = (a as any).views || 0;
        bVal = (b as any).views || 0;
        break;
      case "supporters":
        aVal = a.supporters || 0;
        bVal = b.supporters || 0;
        break;
      case "proposals":
        aVal = a.proposals || 0;
        bVal = b.proposals || 0;
        break;
      case "updated":
      default:
        aVal = new Date(a.updatedAt).getTime();
        bVal = new Date(b.updatedAt).getTime();
        break;
    }
    
    if (direction === "asc") {
      return aVal - bVal;
    } else {
      return bVal - aVal;
    }
  });
  
  const total = items.length;
  const start = (page - 1) * pageSize;
  const slicedItems = items.slice(start, start + pageSize);
  
  return NextResponse.json({ items: slicedItems, total, page, pageSize });
}

// POST /api/needs → 一般ユーザの投稿
export async function POST(req: NextRequest) {
  // レート制限チェック
  const allowed = await rateLimit(req, 'needs_post', 30);
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const json = await req.json().catch(() => ({}));
  
  // Zodバリデーション
  const parsed = NeedSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ 
      error: "validation", 
      issues: parsed.error.flatten() 
    }, { status: 400 });
  }

  const { title, body, summary, area, category, quantity, unitPrice, desiredTiming, privacy } = parsed.data;
  
  // 開発認証からユーザID取得
  const devSession = getDevSession();
  const uid = devSession?.userId || randomUUID();
  
  // スパムチェック
  const spamCheck = checkSpam(title + ' ' + body);
  if (spamCheck.isSpam) {
    return NextResponse.json({ 
      error: "spam_detected", 
      reason: spamCheck.reason 
    }, { status: 422 });
  }
  
  // 概算金額の計算
  const estimateYen = quantity && unitPrice ? quantity * unitPrice : undefined;
  
  const need = await createNeed({
    title,
    body,
    estimateYen,
    ownerMasked: "ユーザ", // 将来はログインユーザ名に置換
    isPublished: false,     // 投稿直後は非公開（管理で公開にする）
    isSample: false,
    ownerUserId: uid,       // ユーザIDを紐付け
  });

  // レスポンス作成
  const response = NextResponse.json({ id: need.id }, { status: 201 });
  
  // uidをCookieに設定（180日間有効）
  response.cookies.set("uid", uid, {
    httpOnly: false,
    sameSite: "lax",
    secure: true,
    maxAge: 60 * 60 * 24 * 180, // 180日
    path: "/",
  });
  
  return response;
}

// スパムチェック関数
function checkSpam(text: string): { isSpam: boolean; reason?: string } {
  const lowerText = text.toLowerCase();
  
  // URL連打チェック
  const urlCount = (lowerText.match(/https?:\/\/[^\s]+/g) || []).length;
  if (urlCount >= 5) {
    return { isSpam: true, reason: "Too many URLs" };
  }
  
  // 連続同文チェック（簡易版）
  const words = lowerText.split(/\s+/);
  const wordGroups = [];
  for (let i = 0; i <= words.length - 5; i++) {
    wordGroups.push(words.slice(i, i + 5).join(' '));
  }
  
  const wordCounts = new Map<string, number>();
  wordGroups.forEach(group => {
    wordCounts.set(group, (wordCounts.get(group) || 0) + 1);
  });
  
  for (const [group, count] of wordCounts) {
    if (count >= 2) {
      return { isSpam: true, reason: "Repeated text detected" };
    }
  }
  
  return { isSpam: false };
}
