import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();
    
    // Get published needs
    const { data: needs } = await supabase
      .from("needs")
      .select("id, updated_at")
      .eq("status", "published")
      .order("updated_at", { ascending: false })
      .limit(5000); // Limit to prevent huge sitemaps
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://needport.jp";
    const now = new Date().toISOString();
    
    // Static pages
    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "daily" },
      { url: "/discover", priority: "0.8", changefreq: "daily" },
      { url: "/needs", priority: "0.8", changefreq: "daily" },
      { url: "/terms", priority: "0.3", changefreq: "monthly" },
      { url: "/privacy", priority: "0.3", changefreq: "monthly" },
      { url: "/tokushoho", priority: "0.3", changefreq: "monthly" },
    ];
    
    // Build XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add static pages
    staticPages.forEach(page => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    });
    
    // Add need pages
    needs?.forEach(need => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/needs/${need.id}</loc>\n`;
      xml += `    <lastmod>${new Date(need.updated_at).toISOString()}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `  </url>\n`;
    });
    
    xml += '</urlset>';
    
    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600"
      }
    });
    
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}
