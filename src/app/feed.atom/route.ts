import { NextResponse } from "next/server";
import { createAdminClientOrNull } from "@/lib/supabase/admin";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const supabase = createAdminClientOrNull();
    
    // Preview environment fallback - return minimal Atom XML
    if (!supabase) {
      console.warn('[PREVIEW_FALLBACK]', { route: '/feed.atom', reason: 'no-supabase-env' });
      const xml = `<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>NeedPort</title><id>https://needport.jp/</id><updated>${new Date().toISOString()}</updated></feed>`;
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
    xml += '<feed xmlns="http://www.w3.org/2005/Atom">\n';
    xml += `  <title>NeedPort - 最新のニーズ</title>\n`;
    xml += `  <link href="${baseUrl}" />\n`;
    xml += `  <link href="${baseUrl}/feed.atom" rel="self" type="application/atom+xml" />\n`;
    xml += `  <id>${baseUrl}/feed.atom</id>\n`;
    xml += `  <updated>${now}</updated>\n`;
    xml += `  <author>\n`;
    xml += `    <name>NeedPort</name>\n`;
    xml += `    <email>info@needport.jp</email>\n`;
    xml += `  </author>\n`;
    xml += `  <subtitle>NeedPortで公開された最新のニーズ一覧</subtitle>\n`;
    
    needs?.forEach(need => {
      const pubDate = new Date(need.created_at).toISOString();
      const updatedDate = new Date(need.updated_at).toISOString();
      const link = `${baseUrl}/needs/${need.id}`;
      const description = need.summary || "詳細はリンク先をご確認ください。";
      
      xml += `  <entry>\n`;
      xml += `    <title><![CDATA[${need.title}]]></title>\n`;
      xml += `    <link href="${link}" />\n`;
      xml += `    <id>${link}</id>\n`;
      xml += `    <published>${pubDate}</published>\n`;
      xml += `    <updated>${updatedDate}</updated>\n`;
      xml += `    <summary type="html"><![CDATA[${description}]]></summary>\n`;
      xml += `  </entry>\n`;
    });
    
    xml += '</feed>';
    
    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/atom+xml",
        "Cache-Control": "public, max-age=1800"
      }
    });
    
  } catch (error) {
    console.error("Atom feed generation error:", error);
    return new NextResponse("Error generating Atom feed", { status: 500 });
  }
}
