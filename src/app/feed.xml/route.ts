import { NextResponse } from "next/server";
import { createAdminClientOrNull } from "@/lib/supabase/admin";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const supabase = createAdminClientOrNull();
    
    // Preview environment fallback - return minimal RSS XML
    if (!supabase) {
      console.warn('[PREVIEW_FALLBACK]', { route: '/feed.xml', reason: 'no-supabase-env' });
      const xml = '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>NeedPort</title><link>https://needport.jp</link><description>Feed unavailable on preview</description></channel></rss>';
      return new NextResponse(xml, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'no-store'
        }
      });
    }
    
    // Get latest published needs
    const { data: needs } = await supabase
      .from("needs")
      .select("id, title, summary, created_at, updated_at")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(50);
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://needport.jp";
    const now = new Date().toISOString();
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n';
    xml += '  <channel>\n';
    xml += `    <title>NeedPort - 最新のニーズ</title>\n`;
    xml += `    <link>${baseUrl}</link>\n`;
    xml += `    <description>NeedPortで公開された最新のニーズ一覧</description>\n`;
    xml += `    <language>ja</language>\n`;
    xml += `    <lastBuildDate>${now}</lastBuildDate>\n`;
    xml += `    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />\n`;
    
    needs?.forEach(need => {
      const pubDate = new Date(need.created_at).toISOString();
      const link = `${baseUrl}/needs/${need.id}`;
      const description = need.summary || "詳細はリンク先をご確認ください。";
      
      xml += `    <item>\n`;
      xml += `      <title><![CDATA[${need.title}]]></title>\n`;
      xml += `      <link>${link}</link>\n`;
      xml += `      <guid>${link}</guid>\n`;
      xml += `      <pubDate>${pubDate}</pubDate>\n`;
      xml += `      <description><![CDATA[${description}]]></description>\n`;
      xml += `    </item>\n`;
    });
    
    xml += '  </channel>\n';
    xml += '</rss>';
    
    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/rss+xml",
        "Cache-Control": "public, max-age=1800"
      }
    });
    
  } catch (error) {
    console.error("RSS feed generation error:", error);
    return new NextResponse("Error generating RSS feed", { status: 500 });
  }
}
