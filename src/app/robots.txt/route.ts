export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET() {
  const isProduction = process.env.NODE_ENV === 'production';
  const isStaging = process.env.NEXT_PUBLIC_APP_ENV === 'staging';
  
  let robotsContent = '';
  
  if (isProduction && !isStaging) {
    // Production - allow all
    robotsContent = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://needport.jp'}/sitemap.xml

# Crawl delay
Crawl-delay: 1`;
  } else {
    // Staging/Development - disallow all
    robotsContent = `User-agent: *
Disallow: /

# This is a staging/development environment
# No indexing allowed`;
  }

  return new NextResponse(robotsContent, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
