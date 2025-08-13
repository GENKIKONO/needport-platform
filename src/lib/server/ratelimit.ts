interface RateLimitConfig {
  limit: number;
  windowMs: number;
  allowlist?: string[];
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private allowlist: Set<string>;

  constructor(private config: RateLimitConfig) {
    this.allowlist = new Set(config.allowlist || []);
  }

  private getKey(route: string, ip: string): string {
    return `${route}:${ip}`;
  }

  private isAllowed(ip: string): boolean {
    return this.allowlist.has(ip);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  check(route: string, ip: string): { allowed: boolean; remaining: number; resetTime: number } {
    // Clean up expired entries
    this.cleanup();

    // Check allowlist
    if (this.isAllowed(ip)) {
      return { allowed: true, remaining: this.config.limit, resetTime: Date.now() + this.config.windowMs };
    }

    const key = this.getKey(route, ip);
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.store.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs
      });
      return { allowed: true, remaining: this.config.limit - 1, resetTime: now + this.config.windowMs };
    }

    if (entry.count >= this.config.limit) {
      // Rate limit exceeded
      return { allowed: false, remaining: 0, resetTime: entry.resetTime };
    }

    // Increment counter
    entry.count++;
    this.store.set(key, entry);

    return { allowed: true, remaining: this.config.limit - entry.count, resetTime: entry.resetTime };
  }

  reset(route: string, ip: string): void {
    const key = this.getKey(route, ip);
    this.store.delete(key);
  }
}

// Global rate limiter instances
const rateLimiters = new Map<string, RateLimiter>();

export function createRateLimiter(route: string, config: RateLimitConfig): RateLimiter {
  if (!rateLimiters.has(route)) {
    rateLimiters.set(route, new RateLimiter(config));
  }
  return rateLimiters.get(route)!;
}

export function checkRateLimit(route: string, ip: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetTime: number } {
  const limiter = createRateLimiter(route, config);
  return limiter.check(route, ip);
}

export function resetRateLimit(route: string, ip: string, config: RateLimitConfig): void {
  const limiter = createRateLimiter(route, config);
  limiter.reset(route, ip);
}

// Helper function to get client IP
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  
  // Fallback for development
  return "127.0.0.1";
}

// Predefined rate limit configurations
export const RATE_LIMITS = {
  PREJOINS: { limit: 10, windowMs: 60 * 1000 }, // 10 per minute
  ADMIN_LOGIN: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 per 15 minutes
  CLIENT_ERROR: { limit: 10, windowMs: 60 * 1000 }, // 10 per minute
  DEFAULT: { limit: 60, windowMs: 60 * 1000 } // 60 per minute
} as const;
