export interface ApiError {
  code: string;
  message: string;
  fields?: Record<string, string>;
}

export function createApiError(
  code: string,
  message: string,
  fields?: Record<string, string>
): ApiError {
  return { code, message, fields };
}

export function createValidationError(fields: Record<string, string>): ApiError {
  return {
    code: 'VALIDATION_ERROR',
    message: '入力内容に誤りがあります',
    fields
  };
}

export function createUnauthorizedError(): ApiError {
  return {
    code: 'UNAUTHORIZED',
    message: '認証が必要です'
  };
}

export function createForbiddenError(): ApiError {
  return {
    code: 'FORBIDDEN',
    message: 'アクセス権限がありません'
  };
}

export function createNotFoundError(): ApiError {
  return {
    code: 'NOT_FOUND',
    message: 'リソースが見つかりません'
  };
}

export function createRateLimitError(): ApiError {
  return {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'リクエストが多すぎます。しばらく待ってから再試行してください'
  };
}
