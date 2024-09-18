const LOG_LEVELS = {
  debug: 0,
  log: 1,
  info: 2,
  warn: 3,
  error: 4,
} as const;

const LOG_LEVEL = LOG_LEVELS[(process.env.LOG_LEVEL as keyof typeof LOG_LEVELS) || 'info'] ?? 1;

class Logger {
  constructor() {}
  debug(...args: Parameters<typeof console.debug>) {
    if (LOG_LEVEL >= LOG_LEVELS.debug) {
      console.debug(...args);
    }
  }
  log(...args: Parameters<typeof console.log>) {
    if (LOG_LEVEL >= LOG_LEVELS.log) {
      console.log(...args);
    }
  }
  info(...args: Parameters<typeof console.info>) {
    if (LOG_LEVEL >= LOG_LEVELS.info) {
      console.info(...args);
    }
  }
  warn(...args: Parameters<typeof console.warn>) {
    if (LOG_LEVEL >= LOG_LEVELS.warn) {
      console.warn(...args);
    }
  }
  error(...args: Parameters<typeof console.error>) {
    if (LOG_LEVEL >= LOG_LEVELS.error) {
      console.error(...args);
    }
  }
}

export const logger = new Logger();
