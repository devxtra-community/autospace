import { Router } from "express";
import type { Router as ExpressRouter } from "express";
// import { authMiddleware } from "../middleware/auth.middleware.js";
import { bookingController } from "../controllers/booking.controller.js";
import { internalAuth } from "../middleware/internal-authmiddleware.js";

const router: ExpressRouter = Router();

router.post("/", internalAuth, bookingController.createBookingController);
router.get("/:id", internalAuth, bookingController.getMyBookings);
router.get("/my", internalAuth, bookingController.getBooking);
router.patch("/update", internalAuth, bookingController.updateStatus);
router.delete("/delete", internalAuth, bookingController.deleteBooking);

export default router;
