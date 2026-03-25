export const logger = {
  info: (message: string, ...args: string[]) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
  },
  error: (message: string, error?: unknown) => {
    if (error instanceof Error) {
      console.error(
        `[ERROR] ${new Date().toISOString()} - ${message}`,
        error.message,
      );
      console.error(error.stack);
    } else {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
    }
  },
  warn: (message: string, ...args: string[]) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
  },
};
