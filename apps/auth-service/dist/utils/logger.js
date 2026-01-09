"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logError = void 0;
const logError = (error, context) => {
    if (error instanceof Error) {
        console.error(`[ERROR]${context ? ` [${context}]` : ''}`, error.message);
        console.error(error.stack);
    }
    else {
        console.error(`[ERROR]${context ? ` [${context}]` : ''}`, error);
    }
};
exports.logError = logError;
