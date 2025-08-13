import { NextResponse, NextRequest } from 'next/server';

const TARGETS = [
  '/api/admin/cron/close-expired',
  '/api/admin/jobs/threshold/run',
  '/api/admin/jobs/moderations/notify',
];

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // 受信の認証（任意）
  const incoming = req.headers.get('authorization');
  if (process.env.CRON_SECRET && incoming !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // origin の決定（最も堅い順）
  const originFromReq = new URL(req.url).origin; // https://xxx.vercel.app
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : originFromReq);

  const results = await Promise.allSettled(
    TARGETS.map(async (path) => {
      const url = `${base}${path}`;
      const res = await fetch(url, {
        headers: process.env.CRON_SECRET
          ? { Authorization: `Bearer ${process.env.CRON_SECRET}` }
          : {},
        cache: 'no-store',
      });
      return { path, ok: res.ok, status: res.status };
    })
  );

  const summary = results.map((r) =>
    r.status === 'fulfilled' ? r.value : { path: '(error)', ok: false, status: 599 }
  );

  return NextResponse.json({ ok: summary.every((s) => s.ok), summary });
}
