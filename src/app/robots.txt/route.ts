import { NextResponse } from "next/server";
export async function GET() {
  const origin = process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://needport.jp";
  const body = `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`;
  return new NextResponse(body, { headers: { "content-type": "text/plain; charset=utf-8" }});
}
