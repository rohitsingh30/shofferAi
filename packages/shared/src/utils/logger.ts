type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  taskId?: string;
  stepNumber?: number;
  [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatLog(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const ctx = context ? ` ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${ctx}`;
}

export const logger = {
  debug(message: string, context?: LogContext) {
    if (shouldLog('debug')) console.debug(formatLog('debug', message, context));
  },
  info(message: string, context?: LogContext) {
    if (shouldLog('info')) console.info(formatLog('info', message, context));
  },
  warn(message: string, context?: LogContext) {
    if (shouldLog('warn')) console.warn(formatLog('warn', message, context));
  },
  error(message: string, context?: LogContext) {
    if (shouldLog('error')) console.error(formatLog('error', message, context));
  },
};
