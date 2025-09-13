import { NextResponse } from 'next/server';

/**
 * 統一されたJSON エラーレスポンス生成
 */
export const jsonError = (code: number, message: string, detail?: any) =>
  NextResponse.json(
    { 
      error: { 
        message, 
        detail 
      } 
    }, 
    { 
      status: code,
      headers: { 
        'Content-Type': 'application/json' 
      }
    }
  );

/**
 * 一般的なエラー定数
 */
export const HTTP_ERRORS = {
  UNAUTHORIZED: (detail?: any) => jsonError(401, 'Unauthorized', detail),
  BAD_REQUEST: (message: string, detail?: any) => jsonError(400, message, detail),
  NOT_FOUND: (message: string = 'Not found', detail?: any) => jsonError(404, message, detail),
  INTERNAL_ERROR: (message: string = 'Internal server error', detail?: any) => jsonError(500, message, detail),
  FORBIDDEN: (message: string = 'Forbidden', detail?: any) => jsonError(403, message, detail),
};

/**
 * エラーログ出力とレスポンス生成を同時に行う
 */
export const logAndReturnError = (error: any, context: string, fallbackMessage: string = 'Operation failed') => {
  console.error(`[${context}] Error:`, error);
  return HTTP_ERRORS.INTERNAL_ERROR(fallbackMessage, {
    context,
    error: error instanceof Error ? error.message : 'Unknown error'
  });
};