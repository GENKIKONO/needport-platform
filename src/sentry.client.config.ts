import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.3 : 0.05,
  debug: false,
  replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0.2,
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 0.01,
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_RELEASE || undefined,
  beforeSend(event) {
    // 開発環境ではエラーを送信しない
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
});
