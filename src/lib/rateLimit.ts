import { NextRequest } from 'next/server';

interface RateLimitConfig {
  limit: number;
  windowMs: number;
  keyGenerator?: (req: NextRequest) => string;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

class RateLimiter {
  private store = new Map<string, { count: number; resetTime: number }>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.store.entries()) {
        if (now > value.resetTime) {
          this.store.delete(key);
        }
      }
    }, 60000);
  }

  async checkLimit(
    key: string,
    limit: number,
    windowMs: number
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const resetTime = now + windowMs;
    
    const current = this.store.get(key);
    
    if (!current || now > current.resetTime) {
      // First request or window expired
      this.store.set(key, { count: 1, resetTime });
      return {
        success: true,
        limit,
        remaining: limit - 1,
        resetTime
      };
    }
    
    if (current.count >= limit) {
      // Rate limit exceeded
      return {
        success: false,
        limit,
        remaining: 0,
        resetTime: current.resetTime,
        retryAfter: Math.ceil((current.resetTime - now) / 1000)
      };
    }
    
    // Increment counter
    current.count++;
    this.store.set(key, current);
    
    return {
      success: true,
      limit,
      remaining: limit - current.count,
      resetTime: current.resetTime
    };
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter();

// Predefined rate limits
export const RATE_LIMITS = {
  PREJOIN: { limit: 10, windowMs: 60 * 1000 }, // 10 per minute
  ADMIN_LOGIN: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 per 15 minutes
  ADMIN_OFFERS: { limit: 30, windowMs: 60 * 1000 }, // 30 per minute
  ADMIN_NEEDS: { limit: 20, windowMs: 60 * 1000 }, // 20 per minute
  CLIENT_ERROR: { limit: 10, windowMs: 60 * 1000 }, // 10 per minute
  SHARE: { limit: 20, windowMs: 60 * 1000 }, // 20 per minute
  DEFAULT: { limit: 60, windowMs: 60 * 1000 } // 60 per minute
} as const;

// Get client IP from request
export function getClientIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         req.headers.get('x-real-ip') ||
         'unknown';
}

// Generate rate limit key
export function generateRateLimitKey(
  req: NextRequest,
  prefix: string,
  customKey?: string
): string {
  const ip = getClientIP(req);
  const userAgent = req.headers.get('user-agent') || 'unknown';
  
  if (customKey) {
    return `${prefix}:${ip}:${customKey}`;
  }
  
  return `${prefix}:${ip}:${userAgent}`;
}

// Main rate limiting function
export async function rateLimit(
  req: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = config.keyGenerator 
    ? config.keyGenerator(req)
    : generateRateLimitKey(req, 'rate_limit');
  
  return rateLimiter.checkLimit(key, config.limit, config.windowMs);
}

// Rate limit middleware wrapper
export function withRateLimit(
  config: RateLimitConfig,
  handler: (req: NextRequest) => Promise<Response>
) {
  return async (req: NextRequest): Promise<Response> => {
    const result = await rateLimit(req, config);
    
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          retryAfter: result.retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': result.retryAfter?.toString() || '60',
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString()
          }
        }
      );
    }
    
    const response = await handler(req);
    
    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', result.limit.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
    
    return response;
  };
}

// Cleanup on process exit
process.on('exit', () => {
  rateLimiter.destroy();
});

process.on('SIGINT', () => {
  rateLimiter.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  rateLimiter.destroy();
  process.exit(0);
});
