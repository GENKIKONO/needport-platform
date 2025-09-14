// src/app/api/health/route.ts
// Runtime health check endpoint

import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/health - Health check endpoint
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
      }
    };

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      ok: true,
      version,
      gitSha,
      timestamp: new Date().toISOString(),
      responseTimeMs: responseTime,
      uptime: process.uptime(),
      checks
    }, {
      status: 200,
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
