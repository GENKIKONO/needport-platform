import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { buildCSP, makeNonce } from "@/lib/security/csp";

export function middleware(req: NextRequest) {
  // CMS ゲート（パスワード保護）
  if (req.nextUrl.pathname.startsWith('/cms')) {
    const cookie = req.headers.get('cookie') ?? '';
    const authed = cookie.includes('cms_auth=1');
    if (authed) {
      // 認証済み：通常のCSP処理を続行
    } else if (req.nextUrl.pathname === '/cms/login') {
      // ログインページ：通常のCSP処理を続行
    } else {
      // 未認証：ログインページにリダイレクト
      const loginUrl = new URL('/cms/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  const res = NextResponse.next();
  const nonce = makeNonce();

  // App Router 側へ nonce を伝搬（必要に応じて useCSPNonce で取得）
  res.headers.set("x-nonce", nonce);

  // 環境に応じた CSP を付与
  const isPreview = process.env.VERCEL_ENV === 'preview';
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isPreview) {
    // プレビュー環境用の緩和されたCSP（Vercel live feedback等を許可）
    const previewCSP = [
      "default-src 'self'",
      "img-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
      "connect-src 'self' https://vercel.live https:",
      "font-src 'self' data:",
      "frame-ancestors 'self'",
    ].join('; ');
    
    res.headers.set("Content-Security-Policy", previewCSP);
  } else {
    // 本番・開発環境用の通常CSP
    res.headers.set("Content-Security-Policy", buildCSP(nonce));
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
