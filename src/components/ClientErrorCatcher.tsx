'use client';
import { useEffect } from 'react';

export default function ClientErrorCatcher() {
  useEffect(() => {
    const onErr = (event: ErrorEvent) => {
      try {
        fetch('/api/client-error', {
          method: 'POST',
          headers: { 'Content-Type':'application/json' },
          body: JSON.stringify({
            type: 'window.onerror',
            message: event?.message,
            stack: event?.error?.stack,
            filename: event?.filename,
            lineno: event?.lineno,
            colno: event?.colno,
            path: window.location.href,
            ua: navigator.userAgent,
          }),
        });
      } catch {}
    };
    const onRej = (event: PromiseRejectionEvent) => {
      try {
        fetch('/api/client-error', {
          method: 'POST',
          headers: { 'Content-Type':'application/json' },
          body: JSON.stringify({
            type: 'unhandledrejection',
            reason: String(event?.reason),
            stack: event?.reason?.stack,
            path: window.location.href,
            ua: navigator.userAgent,
          }),
        });
      } catch {}
    };
    window.addEventListener('error', onErr);
    window.addEventListener('unhandledrejection', onRej);
    return () => {
      window.removeEventListener('error', onErr);
      window.removeEventListener('unhandledrejection', onRej);
    };
  }, []);
  return null;
}
