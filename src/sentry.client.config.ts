import * as Sentry from "@sentry/nextjs";
import { FF_SENTRY } from "@/lib/flags";

if (FF_SENTRY && process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    debug: false,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
  });
}
