export const logger = {
    info: (message, ...args) => {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
    },
    error: (message, error) => {
        if (error instanceof Error) {
            console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error.message);
            console.error(error.stack);
        }
        else {
            console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
        }
    },
    warn: (message, ...args) => {
        console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
    }
};
//# sourceMappingURL=logger.js.map