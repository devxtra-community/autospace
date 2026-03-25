import { Router } from 'express';
import { createBooking, getBooking } from '../controllers/booking.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
const router = Router();
router.post('/', authMiddleware, createBooking);
router.get('/:id', authMiddleware, getBooking);
export default router;
//# sourceMappingURL=booking.routes.js.map