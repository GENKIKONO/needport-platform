import { NextRequest, NextResponse } from 'next/server';

/**
 * Clerk Status Diagnostic API
 * 
 * Provides real-time information about Clerk configuration status
 * without exposing sensitive information. Used by UX fallback components
 * to provide better error messages and diagnostics.
 */

interface ClerkStatusResponse {
  status: 'healthy' | 'degraded' | 'failed';
  checks: {
    publishableKeyConfigured: boolean;
    secretKeyConfigured: boolean;
    keysAreLive: boolean;
    serverReachable: boolean;
  };
  environment: string;
  timestamp: string;
  suggestions: string[];
}

async function checkClerkServerReachability(): Promise<boolean> {
  try {
    // Try to reach Clerk's API without authentication
    const response = await fetch('https://api.clerk.com/v1/health', {
      method: 'GET',
      timeout: 5000
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const secretKey = process.env.CLERK_SECRET_KEY;
    
    const checks = {
      publishableKeyConfigured: !!publishableKey,
      secretKeyConfigured: !!secretKey,
      keysAreLive: !!(publishableKey?.startsWith('pk_live_') && secretKey?.startsWith('sk_live_')),
      serverReachable: await checkClerkServerReachability()
    };

    // Determine overall status
    let status: ClerkStatusResponse['status'] = 'healthy';
    const suggestions: string[] = [];

    if (!checks.publishableKeyConfigured) {
      status = 'failed';
      suggestions.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY環境変数が設定されていません');
    }

    if (!checks.secretKeyConfigured) {
      status = 'failed';
      suggestions.push('CLERK_SECRET_KEY環境変数が設定されていません');
    }

    if (checks.publishableKeyConfigured && checks.secretKeyConfigured && !checks.keysAreLive) {
      status = 'degraded';
      suggestions.push('Test環境のキーが使用されています。本番環境ではLiveキーを使用してください');
    }

    if (!checks.serverReachable) {
      status = 'degraded';
      suggestions.push('Clerkサーバーに接続できません。ネットワーク接続を確認してください');
    }

    // Environment detection
    const environment = process.env.NODE_ENV === 'production' ? 'production' : 'development';

    const response: ClerkStatusResponse = {
      status,
      checks,
      environment,
      timestamp: new Date().toISOString(),
      suggestions
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Clerk status check failed:', error);
    
    return NextResponse.json(
      {
        status: 'failed',
        checks: {
          publishableKeyConfigured: false,
          secretKeyConfigured: false,
          keysAreLive: false,
          serverReachable: false
        },
        environment: 'unknown',
        timestamp: new Date().toISOString(),
        suggestions: ['診断APIでエラーが発生しました']
      } as ClerkStatusResponse,
      { status: 500 }
    );
  }
}

// HEAD method for health checks
export async function HEAD(request: NextRequest) {
  try {
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const secretKey = process.env.CLERK_SECRET_KEY;
    
    if (publishableKey && secretKey) {
      return new NextResponse(null, { status: 200 });
    } else {
      return new NextResponse(null, { status: 503 });
    }
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}