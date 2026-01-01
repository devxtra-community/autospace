export const logError = (error: unknown, context?: string) => {
  if (error instanceof Error) {
    console.error(`[ERROR]${context ? ` [${context}]` : ""}`, error.message);
    console.error(error.stack);
  } else {
    console.error(`[ERROR]${context ? ` [${context}]` : ""}`, error);
  }
};
