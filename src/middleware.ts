import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { FLAGS } from "./config/flags";

export function middleware(req: NextRequest) {
  const env = process.env.VERCEL_ENV || process.env.NODE_ENV || "development";
  if (env !== "production" || !FLAGS.ENFORCE_CANONICAL) return NextResponse.next();

  const canonical = FLAGS.CANONICAL_HOST?.toLowerCase();
  if (!canonical) return NextResponse.next();

  const url = new URL(req.url);
  const host = req.headers.get("host")?.toLowerCase() || "";
  const proto = req.headers.get("x-forwarded-proto") || url.protocol.replace(":", "") || "https";

  // すでに正規ホスト/httpsならそのまま
  if (host === canonical && proto === "https") return NextResponse.next();

  // 正規ホスト + https へ 301（無限ループ防止のため判定済み）
  url.protocol = "https:";
  url.host = canonical;
  return NextResponse.redirect(url, 301);
}
export const config = { matcher: ["/((?!_next|api/og).*)"] };
