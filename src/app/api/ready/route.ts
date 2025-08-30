import { NextResponse } from "next/server";

export async function GET() {
  const reqs = {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: !!process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
    PRICE_FLAT_UNLOCK: !!process.env.PRICE_FLAT_UNLOCK,
    PRICE_PHONE_SUPPORT: !!process.env.PRICE_PHONE_SUPPORT,
    PLATFORM_ORIGIN: !!process.env.PLATFORM_ORIGIN,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    TURNSTILE_SECRET_KEY: !!process.env.TURNSTILE_SECRET_KEY,
    SENTRY_DSN: !!process.env.SENTRY_DSN,
    NEXT_PUBLIC_SENTRY_DSN: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  };
  const missing = Object.entries(reqs).filter(([,v])=>!v).map(([k])=>k);
  const ok = missing.length === 0;
  return NextResponse.json({
    ok,
    checks: reqs,
    missing,
    release: process.env.NEXT_PUBLIC_RELEASE || null
  });
}
