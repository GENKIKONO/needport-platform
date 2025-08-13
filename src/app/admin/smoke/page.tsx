// src/app/admin/smoke/page.tsx

// 開発以外では 404 にする
import { notFound } from 'next/navigation';

if (process.env.NODE_ENV !== 'development') {
  notFound();
}

// 検索避け（任意）
export const metadata = {
  robots: { index: false, follow: false }
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PostResult = { status: number; ok: boolean; body: unknown };

async function postJSON(url: string, body: unknown): Promise<PostResult> {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  let json: unknown = null;
  try {
    json = await r.json();
  } catch {
    // ignore
  }
  return { status: r.status, ok: (json as any)?.ok === true, body: json };
}

export default async function SmokePage() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

  // 1) HEAD で CSP ヘッダ確認
  const head = await fetch(base, { method: 'HEAD', cache: 'no-store' });
  const csp = head.headers.get('content-security-policy');

  // 2) POST テスト (personal)
  const personal = await postJSON(`${base}/api/needs`, {
    title: 'Smoke: 個人',
    summary: 'OK',
    scale: 'personal',
    agree: true,
  });

  // 3) POST テスト (community + macro)
  const community = await postJSON(`${base}/api/needs`, {
    title: 'Smoke: 地域',
    summary: 'OK',
    scale: 'community',
    macro_fee_hint: '月500円〜',
    macro_use_freq: '月1回〜',
    macro_area_hint: '高知県内',
    agree: true,
  });

  return (
    <main style={{ padding: 24, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
      <h1>Smoke (SSR)</h1>
      <pre>
CSP header: {csp ? 'present' : 'missing'}
POST /api/needs (personal): {personal.ok ? 'OK' : `NG (${personal.status})`}
POST /api/needs (community): {community.ok ? 'OK' : `NG (${community.status})`}

personal body: {JSON.stringify(personal.body)}
community body: {JSON.stringify(community.body)}
      </pre>
    </main>
  );
}
