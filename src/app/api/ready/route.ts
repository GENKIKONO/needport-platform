import { NextResponse } from "next/server";
export async function GET() {
  const checks = {
    supabase: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    clerk: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!process.env.CLERK_SECRET_KEY,
    stripe: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && !!process.env.STRIPE_SECRET_KEY && !!process.env.PRICE_FLAT_UNLOCK && !!process.env.PRICE_PHONE_SUPPORT,
    stripeWebhook: !!process.env.STRIPE_WEBHOOK_SECRET,
    turnstile: !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !!process.env.TURNSTILE_SECRET_KEY,
    sentry: !!process.env.SENTRY_DSN && !!process.env.NEXT_PUBLIC_SENTRY_DSN,
    origin: !!process.env.PLATFORM_ORIGIN,
  };
  const ok = Object.values(checks).every(Boolean);
  return NextResponse.json({
    ok,
    checks,
    release: process.env.NEXT_PUBLIC_RELEASE || null
  });
}
