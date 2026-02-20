import { Router } from "express";
import type { Router as ExpressRouter } from "express";
// import { authMiddleware } from "../middleware/auth.middleware.js";
import { bookingController } from "../controllers/booking.controller.js";
import { internalAuth } from "../middleware/internal-authmiddleware.js";
import {
  cancelBooking,
  enterBookingController,
  exitBooking,
  getActiveBooking,
  getBookingHistory,
} from "../controllers/bookingEdge.controller.js";

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

router.post("/:bookingId/enter", internalAuth, enterBookingController);

router.post("/:bookingId/exit", internalAuth, exitBooking);

router.patch("/:bookingId/cancel", internalAuth, cancelBooking);

router.get("/my/active", internalAuth, getActiveBooking);

router.get("/my/history", internalAuth, getBookingHistory);
router.patch(
  "/internal/:bookingId/assign",
  internalAuth,
  bookingController.assignValetInternal,
);

router.patch(
  "/internal/:bookingId/reject",
  internalAuth,
  bookingController.rejectValet,
);

export default router;
