import * as Sentry from "@sentry/nextjs";

// エラーを Sentry に送信
export function captureException(error: Error, context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'development') {
    console.error('Sentry would capture:', error, context);
    return;
  }
  
  Sentry.captureException(error, {
    extra: context,
  });
}

// メッセージを Sentry に送信
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Sentry would capture message:', message, level, context);
    return;
  }
  
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

// ユーザー情報を設定
export function setUser(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser(user);
}

// タグを設定
export function setTag(key: string, value: string) {
  Sentry.setTag(key, value);
}

// コンテキストを設定
export function setContext(name: string, context: Record<string, any>) {
  Sentry.setContext(name, context);
}
