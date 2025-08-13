import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { buildCSP, makeNonce } from "@/lib/security/csp";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const nonce = makeNonce();

  // App Router 側へ nonce を伝搬（必要に応じて useCSPNonce で取得）
  res.headers.set("x-nonce", nonce);

  // 環境に応じた CSP を付与（dev は unsafe-eval 許可 / prod は厳格）
  res.headers.set("Content-Security-Policy", buildCSP(nonce));

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
