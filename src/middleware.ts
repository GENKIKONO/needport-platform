import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { FLAGS } from "./config/flags";

export function middleware(req: NextRequest) {
  if (!FLAGS.ENFORCE_CANONICAL) return NextResponse.next();

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
  if (canonical && host.toLowerCase() !== canonical) {
    url.host = canonical;
    return NextResponse.redirect(url, 301);
  }
  return NextResponse.next();
}
export const config = { matcher: ["/((?!_next|api/og|api/ready).*)"] };
