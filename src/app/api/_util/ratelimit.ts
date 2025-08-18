import { NextRequest } from "next/server";

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  keyPrefix: string;
}

const memoryStore = new Map<string, { count: number; resetTime: number }>();

export async function rateLimit(req: NextRequest, options: RateLimitOptions): Promise<boolean> {
  const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
  const key = `${options.keyPrefix}:${ip}`;
  const now = Date.now();
  
  try {
    // KV優先、メモリフォールバック
    const { kv } = await import("@vercel/kv");
    
    const current = await kv.get<{ count: number; resetTime: number }>(key);
    if (!current || now > current.resetTime) {
      // 新しいウィンドウ
      await kv.set(key, { count: 1, resetTime: now + options.windowMs }, { ex: Math.ceil(options.windowMs / 1000) });
      return true;
    }
    
    if (current.count >= options.maxRequests) {
      return false; // レート制限超過
    }
    
    // カウント増加
    await kv.set(key, { count: current.count + 1, resetTime: current.resetTime }, { ex: Math.ceil(options.windowMs / 1000) });
    return true;
    
  } catch (error) {
    // KVが利用できない場合はメモリストア
    const current = memoryStore.get(key);
    if (!current || now > current.resetTime) {
      memoryStore.set(key, { count: 1, resetTime: now + options.windowMs });
      return true;
    }
    
    if (current.count >= options.maxRequests) {
      return false;
    }
    
    memoryStore.set(key, { count: current.count + 1, resetTime: current.resetTime });
    return true;
  }
}

export function createRateLimit(options: RateLimitOptions) {
  return (req: NextRequest) => rateLimit(req, options);
}
