import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const t = url.searchParams.get('t') ?? '';
  const expected = process.env.ADMIN_ACCESS_TOKEN ?? '';

  if (!expected || t !== expected) {
    return NextResponse.json({ error: 'invalid token' }, { status: 403 });
  }

  cookies().set('admin_token', t, {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 8,
  });

  return NextResponse.redirect(new URL('/admin', req.url));
}
