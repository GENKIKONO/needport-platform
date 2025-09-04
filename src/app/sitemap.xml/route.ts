import { NextResponse } from "next/server";
export const revalidate = 3600;
export async function GET() {
  const origin = process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://needport.jp";
  const urls = [
    `${origin}/v2`,
    `${origin}/needs`,
    `${origin}/vendors`,
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>`+
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`+
  urls.map(u=>`<url><loc>${u}</loc><changefreq>daily</changefreq></url>`).join("")+
  `</urlset>`;
  return new NextResponse(xml, { headers: { "content-type": "application/xml" }});
}
