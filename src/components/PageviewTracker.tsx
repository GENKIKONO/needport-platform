'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function PageviewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Only track in production or when explicitly enabled
    if (process.env.NODE_ENV !== 'production' && !process.env.NEXT_PUBLIC_TRACK_PAGEVIEWS) {
      return;
    }

    // Use sendBeacon for reliable tracking
    if (navigator.sendBeacon) {
      const data = JSON.stringify({ path: pathname });
      navigator.sendBeacon('/api/metrics/pv', data);
    } else {
      // Fallback to fetch
      fetch('/api/metrics/pv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: pathname }),
        keepalive: true,
      }).catch(console.error);
    }
  }, [pathname]);

  return null;
}
