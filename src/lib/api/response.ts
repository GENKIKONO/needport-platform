// src/lib/api/response.ts
// Unified API response helpers for new endpoints

import { NextResponse } from 'next/server';

/**
 * Success response helper
 */
export function ok<T = any>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

/**
 * Error response helper
 */
export function fail(
  error: string,
  detail?: string,
  status = 500
): NextResponse<{ error: string; detail?: string }> {
  const response: { error: string; detail?: string } = { error };
  if (detail) {
    response.detail = detail;
  }
  return NextResponse.json(response, { status });
}