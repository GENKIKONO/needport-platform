'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { getClerkPublishableKey } from '@/lib/env';
import AuthFallback from './AuthFallback';

interface SafeClerkProviderProps {
  children: React.ReactNode;
}

/**
 * Safe wrapper for ClerkProvider that gracefully handles missing publishableKey
 * Enhanced with UX fallback for configuration failures
 * Used to prevent Preview/build crashes when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set
 */
export default function SafeClerkProvider({ children }: SafeClerkProviderProps) {
  const publishableKey = getClerkPublishableKey();
  const [clerkError, setClerkError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Monitor for Clerk initialization errors
    const handleClerkError = (event: any) => {
      if (event.error && event.error.message) {
        setClerkError(event.error.message);
      }
    };

    // Listen for global errors that might be related to Clerk
    const handleGlobalError = (event: ErrorEvent) => {
      if (event.message && event.message.toLowerCase().includes('clerk')) {
        setClerkError(event.message);
      }
    };

    window.addEventListener('error', handleGlobalError);
    
    // Cleanup
    return () => {
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  const handleRetry = () => {
    setClerkError(null);
    setRetryCount(prev => prev + 1);
    
    // Force page reload after 3 retries
    if (retryCount >= 2) {
      window.location.reload();
    }
  };

  // Missing publishable key - different handling for production vs preview
  if (!publishableKey) {
    const isProduction = window.location.hostname === 'needport.jp';
    
    if (isProduction) {
      // Production: Show user-friendly error
      return (
        <AuthFallback
          error="認証システムの設定が見つかりません。運営にお問い合わせください。"
          showDiagnostics={true}
          onRetry={handleRetry}
        />
      );
    } else {
      // Preview/development mode - skip ClerkProvider and render children directly
      console.warn(
        'SafeClerkProvider: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY not found, Clerk features disabled'
      );
      return <>{children}</>;
    }
  }

  // Clerk initialization error - show fallback
  if (clerkError) {
    return (
      <AuthFallback
        error={clerkError}
        showDiagnostics={true}
        onRetry={handleRetry}
      />
    );
  }

  // Production mode with valid key - use normal ClerkProvider
  // CRITICAL FIX: Force standard Clerk domain to prevent clerk.needport.jp DNS errors
  // Extract domain from publishable key to avoid custom domain issues
  let frontendApi = 'allowing-gnat-26.clerk.accounts.dev'; // fallback
  
  try {
    if (publishableKey) {
      // Decode base64 publishable key to extract the frontend API domain
      const keyWithoutPrefix = publishableKey.replace(/^pk_(test|live)_/, '');
      const decoded = atob(keyWithoutPrefix);
      const domainMatch = decoded.match(/([a-zA-Z0-9-]+\.clerk\.accounts\.dev)/);
      if (domainMatch) {
        frontendApi = domainMatch[1];
        console.log('[SafeClerkProvider] Using extracted domain:', frontendApi);
      }
    }
  } catch (error) {
    console.warn('[SafeClerkProvider] Failed to decode publishable key, using fallback domain');
  }
  
  return (
    <ClerkProvider 
      publishableKey={publishableKey}
      frontendApi={frontendApi}
      // Add error boundary for Clerk errors
      onError={(error) => {
        console.error('Clerk error:', error);
        setClerkError(error.message || 'Clerk initialization failed');
      }}
    >
      {children}
    </ClerkProvider>
  );
}