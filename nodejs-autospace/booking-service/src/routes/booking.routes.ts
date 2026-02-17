import { Router } from "express";
import type { Router as ExpressRouter } from "express";
// import { authMiddleware } from "../middleware/auth.middleware.js";
import { bookingController } from "../controllers/booking.controller.js";
import { internalAuth } from "../middleware/internal-authmiddleware.js";

const router: ExpressRouter = Router();

router.get("/valet/requests", internalAuth, bookingController.getValetRequests);

router.get("/valet/active", internalAuth, bookingController.getActiveJobs);

router.get(
  "/valet/completed",
  internalAuth,
  bookingController.getCompletedJobs,
);

router.post("/", internalAuth, bookingController.createBookingController);

router.get("/my", internalAuth, bookingController.getMyBookings);

router.get("/:bookingId", internalAuth, bookingController.getBooking);

router.patch(
  "/update/:bookingId",
  internalAuth,
  bookingController.updateStatus,
);

router.delete(
  "/delete/:bookingId",
  internalAuth,
  bookingController.deleteBooking,
);

router.patch(
  "/:bookingId/confirm",
  internalAuth,
  bookingController.confirmBooking,
);

router.patch(
  "/internal/:bookingId/assign-valet",
  internalAuth,
  bookingController.assignValetInternal,
);

router.patch(
  "/internal/:bookingId/reject-valet",
  internalAuth,
  bookingController.rejectValet,
);

export default router;
