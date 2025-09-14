import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';

/**
 * Generate or extract request ID for tracing
 */
export function getRequestId(request: NextRequest): string {
  // Try to get X-Request-ID from headers first
  const headerRequestId = request.headers.get('x-request-id');
  if (headerRequestId && headerRequestId.length > 0) {
    return headerRequestId;
  }

  // Generate new request ID if not provided
  return randomUUID();
}

/**
 * Add request ID to console logs for tracing
 */
export function logWithRequestId(requestId: string, level: 'info' | 'warn' | 'error', message: string, ...args: any[]) {
  const logMessage = `[${requestId}] ${message}`;
  
  switch (level) {
    case 'info':
      console.info(logMessage, ...args);
      break;
    case 'warn':
      console.warn(logMessage, ...args);
      break;
    case 'error':
      console.error(logMessage, ...args);
      break;
  }
}