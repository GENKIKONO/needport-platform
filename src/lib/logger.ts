type LogLevel = 'info' | 'warn' | 'error';

interface LogContext {
  endpoint?: string;
  userId?: string;
  needId?: string;
  [key: string]: any;
}

function formatTimestamp(): string {
  return new Date().toISOString();
}

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = formatTimestamp();
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
}

export function info(message: string, context?: LogContext): void {
  console.log(formatMessage('info', message, context));
}

export function warn(message: string, context?: LogContext): void {
  console.warn(formatMessage('warn', message, context));
}

export function error(message: string, context?: LogContext): void {
  console.error(formatMessage('error', message, context));
}
