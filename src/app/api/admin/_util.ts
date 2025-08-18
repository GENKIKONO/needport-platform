import { NextRequest, NextResponse } from "next/server";

// 簡易レートリミット（インメモリ）
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const minute = Math.floor(now / 60000);
  const key = `${ip}:${minute}`;
  
  const current = rateLimitMap.get(key);
  if (!current || current.resetTime !== minute) {
    rateLimitMap.set(key, { count: 1, resetTime: minute });
    return true;
  }
  
  if (current.count >= 30) {
    return false;
  }
  
  current.count++;
  return true;
}

export function guard(req: NextRequest) {
  // レートリミットチェック
  const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  
  const token = process.env.ADMIN_ACCESS_TOKEN;
  const cookie = req.cookies.get("admin_token")?.value;
  if (!token || cookie !== token) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return null;
}
