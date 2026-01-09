"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const logger_1 = require("../utils/logger");
const globalErrorHandler = (err, _req, res, _next) => {
    void _next;
    (0, logger_1.logError)(err, 'global-error-handler');
    res.status(500).json({ message: 'Internal server error' });
};
exports.globalErrorHandler = globalErrorHandler;
