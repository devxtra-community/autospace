import { logger } from '../utils/logger.js';
export const errorHandler = (err, req, res, next) => {
    logger.error('Unhandled Error', err);
    res.status(500).json({ message: 'Internal Server Error' });
};
//# sourceMappingURL=error.middleware.js.map