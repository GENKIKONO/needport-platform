// src/lib/engagements.ts
// Anonymous key generation and engagement services for collective demand visualization

import { createHash } from 'crypto';
import { NextRequest } from 'next/server';

// Rate limiting storage for anonymous interactions
const anonymousRateLimit = new Map<string, { count: number; resetTime: number }>();

export interface EngagementSummary {
  interest_users: number;
  pledge_users: number;
  anon_interest_today: number;
  anon_interest_total: number;
}

export type EngagementKind = 'interest' | 'pledge';

/**
 * Generate anonymous key from IP + User-Agent + salt
 * Used to prevent duplicate anonymous interest from same user on same day
 */
export function generateAnonymousKey(request: NextRequest): string {
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || '';
  const salt = process.env.ANON_SALT || 'default-salt-please-change-in-production';
  
  const combined = `${ip}:${userAgent}:${salt}`;
  return createHash('sha256').update(combined).digest('hex');
}

/**
 * Extract client IP address from request
 * Handles various proxy headers like Vercel/Cloudflare
 */
export function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return request.ip || 'unknown';
}

/**
 * Check if IP address has exceeded anonymous engagement rate limit
 * Rate limit: 10 anonymous interactions per minute per IP
 */
export function checkAnonymousRateLimit(ip: string): boolean {
  const now = Date.now();
  const key = `anon:${ip}`;
  const limit = parseInt(process.env.ANON_RATE_LIMIT || '10', 10);
  const windowMs = 60 * 1000; // 1 minute
  
  const entry = anonymousRateLimit.get(key);
  
  if (!entry) {
    anonymousRateLimit.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (now > entry.resetTime) {
    // Reset window
    anonymousRateLimit.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (entry.count >= limit) {
    return false; // Rate limit exceeded
  }
  
  entry.count += 1;
  return true;
}

/**
 * Clean up old rate limit entries to prevent memory leaks
 * Should be called periodically
 */
export function cleanupRateLimit(): void {
  const now = Date.now();
  for (const [key, entry] of anonymousRateLimit.entries()) {
    if (now > entry.resetTime + 60000) { // 1 minute grace period
      anonymousRateLimit.delete(key);
    }
  }
}

/**
 * Validate engagement kind
 */
export function isValidEngagementKind(kind: any): kind is EngagementKind {
  return kind === 'interest' || kind === 'pledge';
}

/**
 * Check if a need has reached its pledge threshold for business viability
 */
export function hasReachedPledgeThreshold(pledgeCount: number, threshold: number): boolean {
  return pledgeCount >= threshold;
}

/**
 * Format engagement summary for display
 */
export function formatEngagementDisplay(summary: EngagementSummary) {
  const parts = [];
  
  if (summary.pledge_users > 0) {
    parts.push(`購入したい ${summary.pledge_users}`);
  }
  
  if (summary.interest_users > 0) {
    parts.push(`興味あり ${summary.interest_users}`);
  }
  
  if (summary.anon_interest_total > 0) {
    parts.push(`気になる ${summary.anon_interest_total}`);
  }
  
  return parts.join(' / ');
}

/**
 * Calculate engagement percentage for meter display
 */
export function calculateEngagementPercentage(
  pledgeUsers: number,
  interestUsers: number,
  threshold: number,
  maxDisplay: number = 100
): { pledgePercent: number; interestPercent: number } {
  const total = pledgeUsers + interestUsers;
  const targetProgress = Math.min((pledgeUsers / threshold) * 100, 100);
  
  return {
    pledgePercent: Math.min((pledgeUsers / Math.max(total, threshold)) * 100, maxDisplay),
    interestPercent: Math.min((interestUsers / Math.max(total, threshold)) * 100, maxDisplay)
  };
}

// Cleanup rate limit entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimit, 5 * 60 * 1000);
}