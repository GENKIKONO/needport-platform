// NOTE: 簡易インメモリ・レートリミット（インスタンス単位）
// 対象: /api/* （Stripe Webhookは除外）
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type Hit = { ts: number };
const BUCKET = new Map<string, Hit[]>();
const WINDOW_MS = 60_000; // 60秒
const LIMIT = 60;         // 1分あたり 60 リクエスト/ IP

export function apiRateLimit(req: NextRequest) {
  const { pathname } = new URL(req.url);
  if (!pathname.startsWith('/api')) return null;
  if (pathname.startsWith('/api/webhook/stripe')) return null;

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.ip || '0.0.0.0';
  const now = Date.now();
  const hits = BUCKET.get(ip) ?? [];
  // ウィンドウ外を掃除
  const recent = hits.filter(h => now - h.ts < WINDOW_MS);
  recent.push({ ts: now });
  BUCKET.set(ip, recent);

  if (recent.length > LIMIT) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429, headers: { 'Retry-After': '60' } });
  }
  return null;
}
