import { Router } from "express";
import {
  resolveGarage,
  registerValet,
  getAvailableValetController,
  assignValetController,
  releaseValetController,
  rejectBookingController,
} from "../controllers/internal-valet.controller";
import { getMyValetController } from "../controllers/valet.controller";
import { internalAuth } from "../../../middlewares/internalAuth.middleware";

const router = Router();

router.use(internalAuth); // Strictly enforce internal service token for all internal routes

router.post("/resolve-garage", resolveGarage);

router.post("/register", registerValet);

router.get("/me", getMyValetController);

router.get("/available/:garageId", getAvailableValetController);

router.patch("/:valetId/assign", assignValetController);

router.patch("/:valetId/reject", rejectBookingController);

router.patch("/:valetId/release", releaseValetController);

export default router;
