'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { getClerkPublishableKey } from '@/lib/env';

interface SafeClerkProviderProps {
  children: React.ReactNode;
}

/**
 * Safe wrapper for ClerkProvider that gracefully handles missing publishableKey
 * Used to prevent Preview/build crashes when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set
 */
export default function SafeClerkProvider({ children }: SafeClerkProviderProps) {
  const publishableKey = getClerkPublishableKey();

  if (!publishableKey) {
    // Preview mode or missing key - skip ClerkProvider and render children directly
    console.warn(
      'SafeClerkProvider: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY not found, Clerk features disabled'
    );
    return <>{children}</>;
  }

  // Production mode with valid key - use normal ClerkProvider
  return <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>;
}