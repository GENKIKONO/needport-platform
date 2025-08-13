export const dynamic = "force-dynamic";

import { supabaseServer } from '@/lib/server/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = supabaseServer();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://needport.jp';
    
    // Fetch latest published needs
    const { data: needs, error } = await supabase
      .from('needs')
      .select('id, title, summary, created_at')
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[rss] error:', error);
      return new NextResponse('Error generating RSS feed', { status: 500 });
    }

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>NeedPort - ニーズ募集</title>
    <link>${baseUrl}</link>
    <description>ニーズ募集・オファー比較プラットフォーム</description>
    <language>ja</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feeds/needs.xml" rel="self" type="application/rss+xml" />
    ${(needs || []).map(need => `
    <item>
      <title>${need.title.replace(/[<>&]/g, (c) => {
        const entities: Record<string, string> = { '<': '&lt;', '>': '&gt;', '&': '&amp;' };
        return entities[c];
      })}</title>
      <link>${baseUrl}/needs/${need.id}</link>
      <description>${(need.summary || '').replace(/[<>&]/g, (c) => {
        const entities: Record<string, string> = { '<': '&lt;', '>': '&gt;', '&': '&amp;' };
        return entities[c];
      })}</description>
      <pubDate>${new Date(need.created_at).toUTCString()}</pubDate>
      <guid>${baseUrl}/needs/${need.id}</guid>
    </item>
    `).join('')}
  </channel>
</rss>`;

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/rss+xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('[rss] error:', error);
    return new NextResponse('Error generating RSS feed', { status: 500 });
  }
}
