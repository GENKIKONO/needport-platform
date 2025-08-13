// src/app/api/admin/cron/daily/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Node ランタイムでOK（Edge だと crypto など制約が厳しい）

// ここで複数のジョブを「1本のデイリールート」に集約する
const TASKS = [
  '/api/admin/cron/close-expired',
  '/api/admin/jobs/threshold/run',
  '/api/admin/jobs/moderations/notify',
];

export async function GET(req: Request) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;

  const results = await Promise.allSettled(
    TASKS.map((p) =>
      fetch(new URL(p, base), {
        // 必要ならヘッダーで簡易認証（各ジョブ側に検査を追加してもOK）
        headers: process.env.CRON_SECRET
          ? { Authorization: `Bearer ${process.env.CRON_SECRET}` }
          : undefined,
      })
    )
  );

  const summary = results.map((r, i) =>
    r.status === 'fulfilled'
      ? { path: TASKS[i], ok: r.value.ok, status: r.value.status }
      : { path: TASKS[i], ok: false, error: String(r.reason) }
  );

  const ok = summary.every((s) => (s as any).ok);
  return NextResponse.json({ ok, summary });
}
