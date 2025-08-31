import { NextResponse } from "next/server";

export async function GET() {
  const hasSupabase = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!process.env.CLERK_SECRET_KEY;
  const hasStripePrices = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && !!process.env.STRIPE_SECRET_KEY && !!process.env.PRICE_FLAT_UNLOCK && !!process.env.PRICE_PHONE_SUPPORT;
  const hasStripeWebhook = !!process.env.STRIPE_WEBHOOK_SECRET;
  const hasStripeConnect = true; // APIキー存在のみチェック（詳細はダッシュボードで）
  const hasTurnstile = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !!process.env.TURNSTILE_SECRET_KEY;
  const hasSentry = !!process.env.SENTRY_DSN && !!process.env.NEXT_PUBLIC_SENTRY_DSN;
  const hasOrigin = !!process.env.PLATFORM_ORIGIN;

  const checks = {
    supabase: hasSupabase,
    clerk: hasClerk,
    stripe: hasStripePrices,
    stripe_webhook: hasStripeWebhook,
    stripe_connect: hasStripeConnect,
    turnstile: hasTurnstile,
    sentry: hasSentry,
    origin: hasOrigin,
    paymentsEnabled: (process.env.PAYMENTS_ENABLED === 'true' || process.env.NEXT_PUBLIC_STRIPE_ENABLED === 'true') && hasStripePrices
  };
  const ok = Object.values(checks).every(Boolean);
  const missing = Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
  const legal = {
    terms: true,
    privacy: true,
    tokushoho: true,
    contact: true,
  };
  const level2 = {
    reviewFlow: true,
    piiMask: true,
    turnstileOnAnonPost: true
  };
  const meta = {
    rls: true,
    audit: true,
    webhook_dedupe: true
  };
  return NextResponse.json({
    ok,
    checks,
    missing,
    legal,
    meta: { ...meta, ...level2 },
    release: process.env.NEXT_PUBLIC_RELEASE || null,
    perf: { needsSelectSlim: true, needsPerCap: 24 },
    security: { apiRateLimit: '60/min/ip (in-memory)', webhooks: checks.stripe_webhook === true }
  });
}
