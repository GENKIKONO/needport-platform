import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const t = url.searchParams.get('t') ?? '';
  const token = process.env.ADMIN_ACCESS_TOKEN ?? '';

  // トークン未設定 or 不一致 → 403
  if (!t || !token || t !== token) {
    return new NextResponse('forbidden', { status: 403 });
  }

  const res = NextResponse.redirect(new URL('/admin', req.url));
  res.cookies.set('admin_token', t, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8h
  });
  return res;
}
