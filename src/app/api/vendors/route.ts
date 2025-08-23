import { NextRequest, NextResponse } from 'next/server';
import { VendorSchema } from '@/lib/validation/vendor';
import { createVendor } from '@/lib/server/vendors';
import { getDevSession } from '@/lib/devAuth';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 簡易レート制限
async function rateLimit(req: NextRequest, key: string, limitPerMin: number = 5): Promise<boolean> {
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

// POST /api/vendors → 事業者登録
export async function POST(req: NextRequest) {
  try {
    // レート制限チェック（5分に1件）
    const allowed = await rateLimit(req, 'vendors_post', 1);
    if (!allowed) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }

    const json = await req.json();
    const parsed = VendorSchema.safeParse(json);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        error: "validation", 
        issues: parsed.error.flatten() 
      }, { status: 400 });
    }

    const data = parsed.data;
    
    // 開発認証からユーザID取得
    const devSession = getDevSession();
    const ownerId = devSession?.userId || 'anonymous';
    
    // スパムチェック
    const spamCheck = checkSpam(data.description);
    if (spamCheck.isSpam) {
      return NextResponse.json({ 
        error: "spam_detected", 
        reason: spamCheck.reason 
      }, { status: 422 });
    }
    
    // 事業者作成
    const result = await createVendor(data, ownerId);
    
    return NextResponse.json({ 
      vendorId: result.vendor.id,
      reviewId: result.reviewId,
      status: result.status
    }, { status: 201 });
    
  } catch (error) {
    console.error('Vendor registration error:', error);
    return NextResponse.json({ 
      error: "internal_error" 
    }, { status: 500 });
  }
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
