import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// Edge環境ではパスエイリアスが崩れることがあるため相対パス参照に変更
import { FLAGS } from "./config/flags";

export function middleware(req: NextRequest) {
  // 本番(Production)以外は正規化を無効化（Preview/Devは素通し）
  const env = process.env.VERCEL_ENV || process.env.NODE_ENV || "development";
  if (env !== "production" || !FLAGS.ENFORCE_CANONICAL) {
    return NextResponse.next();
  }

  const host = req.headers.get("host") || "";
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const url = new URL(req.url);

  // HTTPS 強制
  if (proto !== "https") {
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }
  // ホスト正規化
  const canonical = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "").toLowerCase();
  // 本番でも、canonical未設定 or 未接続の可能性があるので guard
  if (canonical && host.toLowerCase() !== canonical) {
    url.host = canonical;
    return NextResponse.redirect(url, 301);
  }
  return NextResponse.next();
}
export const config = { matcher: ["/((?!_next|api/og|api/ready).*)"] };
