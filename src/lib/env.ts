import { z } from 'zod';

// Environment variable schema
const envSchema = z.object({
  // Database
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  
  // Authentication
  ADMIN_PIN: z.string().min(1).optional(),
  AUTH_PROVIDER: z.enum(['anon', 'clerk']).default('anon'),
  CLERK_PUBLISHABLE_KEY: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional(),
  
  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().email().optional(),
  MAIL_TO_OWNER: z.string().email().optional(),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_ENABLED: z.boolean().default(false),
  STRIPE_CONNECT_UI: z.boolean().default(false),
  PAYMENTS_ENABLED: z.boolean().default(false),
  
  // Feature Flags
  FF_MAINTENANCE: z.boolean().default(false),
  FF_PAGINATION: z.boolean().default(false),
  FF_PUBLIC_ENTRY: z.boolean().default(false),
  NEXT_PUBLIC_DEMO_MODE: z.boolean().default(false),
  
  // Security
  HOOK_SECRET: z.string().optional(),
  RATE_LIMIT_ALLOWLIST: z.string().optional(),
  
  // Legal
  LEGAL_COMPANY_NAME: z.string().optional(),
  LEGAL_ADDRESS: z.string().optional(),
  LEGAL_CONTACT: z.string().optional(),
  LEGAL_REP: z.string().optional(),
  LEGAL_SUPPORT_EMAIL: z.string().email().optional(),
  
  // Cookies
  COOKIE_DOMAIN: z.string().optional(),
  MAINTENANCE_ALLOW_COOKIE: z.string().default('maint-ok'),
  
  // Site
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  CANONICAL_HOST: z.string().optional(),
  NEXT_PUBLIC_BUILD_SHA: z.string().optional(),
  
  // Monitoring
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  SENTRY_ENABLED: z.boolean().default(false),
  
  // Redis (for rate limiting)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Parse and validate environment variables
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      (error as z.ZodError).issues.forEach((err: any) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error('Environment validation failed');
    }
    throw error;
  }
}

// Export validated environment
export const env = validateEnv();

// Helper functions for common environment checks
export function isProduction(): boolean {
  return env.NODE_ENV === 'production';
}

export function isDevelopment(): boolean {
  return env.NODE_ENV === 'development';
}

export function isTest(): boolean {
  return env.NODE_ENV === 'test';
}

export function isStripeEnabled(): boolean {
  return env.STRIPE_ENABLED;
}

export function isPaymentsEnabled(): boolean {
  return env.PAYMENTS_ENABLED;
}

export function isDemoMode(): boolean {
  return env.NEXT_PUBLIC_DEMO_MODE;
}

export function isMaintenanceMode(): boolean {
  return env.FF_MAINTENANCE;
}

export function isSentryEnabled(): boolean {
  return env.SENTRY_ENABLED && !!env.NEXT_PUBLIC_SENTRY_DSN;
}

export function getAuthProvider(): 'anon' | 'clerk' {
  return env.AUTH_PROVIDER;
}

export function isClerkEnabled(): boolean {
  return env.AUTH_PROVIDER === 'clerk' && !!env.CLERK_PUBLISHABLE_KEY && !!env.CLERK_SECRET_KEY;
}

export const IS_PREVIEW = process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";

// プレビューモード禁止の運用ルール
export const IS_PRODUCTION = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";
export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

// 本番URLのみを共有するための判定
export const SHOULD_SHARE_PRODUCTION_URL = IS_PRODUCTION;
