import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.text();
  const pass = new URLSearchParams(body).get('pass');
  if (!pass || pass !== process.env.CMS_PASS) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const res = NextResponse.redirect(new URL('/cms', req.url));
  res.headers.append('Set-Cookie', `cms_auth=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60*60*8}`);
  return res;
}
