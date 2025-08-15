import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const noindex = process.env.NEXT_PUBLIC_SITE_NOINDEX === '1';
  const isProduction = process.env.NODE_ENV === 'production';
  const isStaging = process.env.NEXT_PUBLIC_APP_ENV === 'staging';
  
  let robotsContent = '';
  
  if (noindex) {
    // Force no-index mode
    robotsContent = `User-agent: *
Disallow: /

# No indexing mode enabled
# This site should not be indexed`;
  } else if (isProduction && !isStaging) {
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
