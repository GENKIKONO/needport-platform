/**
 * Environment variable helpers for safe access
 * Prevents module-scope throws that can break builds/runtime
 */

export function getClerkPublishableKey(): string | null {
  return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? null;
}