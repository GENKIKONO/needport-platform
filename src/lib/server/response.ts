import { NextResponse } from 'next/server';
import { generateRequestId } from './health';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  requestId: string;
  timestamp: string;
}

export function createSuccessResponse<T>(data: T, status: number = 200): NextResponse<ApiResponse<T>> {
  const requestId = generateRequestId();
  
  return NextResponse.json({
    data,
    requestId,
    timestamp: new Date().toISOString(),
  }, { status });
}

export function createErrorResponse(error: string, status: number = 500): NextResponse<ApiResponse> {
  const requestId = generateRequestId();
  
  return NextResponse.json({
    error,
    requestId,
    timestamp: new Date().toISOString(),
  }, { status });
}

export function createNotConfiguredResponse(service: string): NextResponse<ApiResponse> {
  return createErrorResponse(`${service} not configured`, 503);
}

export function createUnauthorizedResponse(): NextResponse<ApiResponse> {
  return createErrorResponse('Unauthorized', 401);
}

export function createNotFoundResponse(resource: string): NextResponse<ApiResponse> {
  return createErrorResponse(`${resource} not found`, 404);
}

export function createBadRequestResponse(message: string): NextResponse<ApiResponse> {
  return createErrorResponse(message, 400);
}

export function createInternalErrorResponse(): NextResponse<ApiResponse> {
  return createErrorResponse('Internal server error', 500);
}
