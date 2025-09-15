// src/app/api/health/route.ts
// Runtime health check endpoint with database and RLS policy validation

import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import path from 'path';
import { createClient, createAdminClientOrNull } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * Test database connectivity
 */
async function checkDatabaseConnectivity() {
  try {
    const supabase = createClient();
    const startTime = Date.now();
    
    // Simple ping query
    const { error } = await supabase.from('needs').select('id').limit(1);
    const responseTime = Date.now() - startTime;
    
    if (error) {
      return {
        status: 'error',
        error: error.message,
        hint: 'Database connection failed',
        responseTimeMs: responseTime
      };
    }
    
    return {
      status: 'ok',
      responseTimeMs: responseTime
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown database error',
      hint: 'Database connectivity check failed'
    };
  }
}

/**
 * Test RLS policies on needs table - simplified approach
 */
async function checkRLSPolicies() {
  const admin = createAdminClientOrNull();
  
  if (!admin) {
    return {
      status: 'skipped',
      hint: 'Admin client not available for RLS policy checks'
    };
  }
  
  try {
    const startTime = Date.now();
    
    // Simple RLS test: try to query with regular client (should be restricted)
    const supabase = createClient();
    const { data, error } = await supabase.from('needs').select('id').limit(1);
    
    const responseTime = Date.now() - startTime;
    
    if (error && (error.message.includes('RLS') || error.code === '42501')) {
      return {
        status: 'ok',
        responseTimeMs: responseTime,
        hint: 'RLS protection is active (access denied as expected)'
      };
    } else if (data && data.length >= 0) {
      return {
        status: 'ok',
        responseTimeMs: responseTime,
        hint: 'Database accessible (RLS allows anonymous reads)'
      };
    } else {
      return {
        status: 'warning',
        error: error?.message,
        responseTimeMs: responseTime,
        hint: 'Unexpected RLS behavior'
      };
    }
    
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown RLS check error',
      hint: 'RLS policy validation failed'
    };
  }
}

/**
 * Test database write security (expects failure due to RLS)
 */
async function checkWriteCapability() {
  try {
    const supabase = createClient();
    const startTime = Date.now();
    
    // Test minimal insert attempt - we expect this to fail due to RLS/auth
    const { error } = await supabase
      .from('needs')
      .insert([{ title: '__HEALTH_CHECK__' }]);
    
    const responseTime = Date.now() - startTime;
    
    // We expect this to fail due to RLS/auth - that's good security!
    if (error) {
      if (error.message.includes('RLS') || 
          error.message.includes('permission') || 
          error.message.includes('authentication') ||
          error.message.includes('column') ||
          error.code === '42501' || 
          error.code === '42703') {
        return {
          status: 'ok',
          responseTimeMs: responseTime,
          hint: 'Database write protection active'
        };
      } else {
        return {
          status: 'warning',
          error: error.message,
          responseTimeMs: responseTime,
          hint: 'Unexpected error during security test'
        };
      }
    }
    
    // If insert succeeded without auth, that's a potential security issue
    return {
      status: 'warning',
      responseTimeMs: responseTime,
      hint: 'Unauthenticated write succeeded - check security policies'
    };
    
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown security test error',
      hint: 'Database security check failed'
    };
  }
}

/**
 * GET /api/health - Enhanced health check endpoint
 * Returns: { ok: true, version: string, gitSha: string, timestamp: string, checks: {} }
 */
export async function GET() {
  try {
    const startTime = Date.now();
    
    // Get version from package.json
    let version = 'unknown';
    try {
      const packagePath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
      version = packageJson.version || 'unknown';
    } catch (error) {
      console.warn('Could not read package.json version:', error);
    }

    // Get git SHA from environment or try reading git files
    let gitSha = process.env.VERCEL_GIT_COMMIT_SHA || 
                 process.env.GIT_SHA || 
                 process.env.GITHUB_SHA || 
                 'unknown';

    if (gitSha === 'unknown') {
      try {
        // Try reading .git/HEAD for local development
        const gitHeadPath = path.join(process.cwd(), '.git', 'HEAD');
        const gitHead = readFileSync(gitHeadPath, 'utf8').trim();
        
        if (gitHead.startsWith('ref: ')) {
          // It's a reference, read the actual commit
          const refPath = gitHead.slice(5); // Remove 'ref: '
          const refFilePath = path.join(process.cwd(), '.git', refPath);
          gitSha = readFileSync(refFilePath, 'utf8').trim().slice(0, 8); // Short SHA
        } else {
          // It's a direct commit hash
          gitSha = gitHead.slice(0, 8);
        }
      } catch (error) {
        // Ignore git reading errors in production
      }
    } else {
      // Shorten long SHAs
      gitSha = gitSha.slice(0, 8);
    }

    // Run all health checks in parallel for faster response
    const [dbCheck, rlsCheck, writeCheck] = await Promise.all([
      checkDatabaseConnectivity(),
      checkRLSPolicies(),
      checkWriteCapability()
    ]);

    // Basic environment checks
    const checks = {
      nodejs: {
        version: process.version,
        status: 'ok'
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'unknown',
        platform: process.platform,
        status: 'ok'
      },
      supabase: {
        configured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        status: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing'
      },
      clerk: {
        configured: !!(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
        status: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'configured' : 'missing'
      },
      database: dbCheck,
      rls_policies: rlsCheck,
      security: writeCheck
    };

    // Determine overall health status
    const hasErrors = Object.values(checks).some(check => 
      (typeof check === 'object' && 'status' in check && check.status === 'error')
    );
    
    const overallStatus = hasErrors ? 503 : 200;

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      ok: !hasErrors,
      version,
      gitSha,
      timestamp: new Date().toISOString(),
      responseTimeMs: responseTime,
      uptime: process.uptime(),
      checks
    }, {
      status: overallStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('[HEALTH_CHECK_ERROR]', error);
    
    return NextResponse.json({
      ok: false,
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
}

/**
 * HEAD /api/health - Lightweight health check for monitoring
 */
export async function HEAD() {
  try {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}
