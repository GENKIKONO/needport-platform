import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({}));
  const ok = password && password === process.env.CMS_PASS;
  const res = NextResponse.json({ ok });
  if (ok) {
    res.cookies.set(process.env.CMS_COOKIE ?? 'cms_auth', '1', {
      httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 60*60*8
    });
  }
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(process.env.CMS_COOKIE ?? 'cms_auth', '', { path: '/', maxAge: 0 });
  return res;
}
