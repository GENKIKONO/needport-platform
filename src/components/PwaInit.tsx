'use client';

import { useEffect } from 'react';

export default function PwaInit() {
  useEffect(() => {
    // Only register SW if PWA is enabled
    if (process.env.NEXT_PUBLIC_PWA_ENABLED !== 'true') {
      return;
    }

    // Check if service workers are supported
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);

  return null;
}
