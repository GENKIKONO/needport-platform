import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const digest = searchParams.get('digest');
    const digestHeader = request.headers.get('x-digest');
    
    const shouldRunDigest = digest === 'today' || digestHeader === '1';
    
    const results = {
      retried: 0,
      sent: 0,
      digest: false
    };

    // Call retry-due endpoint
    try {
      const retryResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/notifications/retry-due`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ limit: 50 }),
      });

      if (retryResponse.ok) {
        const retryData = await retryResponse.json();
        results.retried = retryData.retried || 0;
      }
    } catch (error) {
      console.error('[cron] retry-due error:', error);
    }

    // Call digest endpoint if requested
    if (shouldRunDigest) {
      try {
        const digestResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/notifications/digest`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        if (digestResponse.ok) {
          const digestData = await digestResponse.json();
          results.sent = digestData.sent || 0;
          results.digest = true;
        }
      } catch (error) {
        console.error('[cron] digest error:', error);
      }
    }

    return NextResponse.json(results);

  } catch (error) {
    console.error('[cron] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
