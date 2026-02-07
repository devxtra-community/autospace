import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
  createBooking,
  getBooking,
} from "../controllers/booking.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router: ExpressRouter = Router();

router.post("/", authMiddleware, createBooking);
router.get("/:id", authMiddleware, getBooking);

export default router;
