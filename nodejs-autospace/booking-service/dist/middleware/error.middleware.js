import { logger } from "../utils/logger.js";
import { HttpError } from "../utils/HttpError.js";
export const errorHandler = (err, req, res, next) => {
    void next;
    logger.error("Unhandled Error", err);
    // Handle known HttpError
    if (err instanceof HttpError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }
    // Handle normal JS Error
    if (err instanceof Error) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
    // Fallback
    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
    });
};
//# sourceMappingURL=error.middleware.js.map