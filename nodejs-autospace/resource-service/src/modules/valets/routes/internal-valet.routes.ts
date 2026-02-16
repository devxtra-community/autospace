import { Router } from "express";
import {
  resolveGarage,
  registerValet,
  getAvailableValetController,
  assignValetController,
  releaseValetController,
} from "../controllers/internal-valet.controller";
import { getMyValetController } from "../controllers/valet.controller";
import { internalAuth } from "../../../middlewares/internalAuth.middleware";

const router = Router();

router.post("/resolve-garage", resolveGarage);

router.post("/register", registerValet);

router.get("/me", internalAuth, getMyValetController);

router.get("/available/:garageId", getAvailableValetController);

router.patch("/:valetId/assign", assignValetController);

router.patch("/:valetId/release", releaseValetController);

export default router;
