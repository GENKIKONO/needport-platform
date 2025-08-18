import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { listNeedsByOwner } from "@/lib/admin/store";
import { rateLimit } from "@/app/api/_util/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  email: z.string().email()
});

export async function POST(req: NextRequest) {
  // レート制限チェック
  const allowed = await rateLimit(req, { maxRequests: 5, windowMs: 300000, keyPrefix: "me_claim" }); // 5分に5回
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { email } = requestSchema.parse(body);
    
    // 指定メールの投稿が存在するかチェック
    const needs = await listNeedsByOwner(email, { includeDeleted: false });
    if (needs.length === 0) {
      return NextResponse.json({ error: "no_posts_found" }, { status: 404 });
    }
    
    // トークン生成（簡易版：UUID）
    const token = crypto.randomUUID();
    const claimData = { email, createdAt: new Date().toISOString() };
    
    // KVに保存（TTL: 30分）
    try {
      const { kv } = await import("@vercel/kv");
      await kv.set(`claim:${token}`, claimData, { ex: 1800 }); // 30分
    } catch (error) {
      console.error("Failed to save claim token:", error);
      return NextResponse.json({ error: "storage_error" }, { status: 500 });
    }
    
    const claimUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/claim/${token}`;
    
    return NextResponse.json({ 
      claimUrl,
      message: "メール認証リンクを生成しました。このURLをクリックして本人確認を行ってください。"
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
