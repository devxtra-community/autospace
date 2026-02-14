import { Router } from "express";
import {
  resolveGarage,
  registerValet,
  getAvailableValetController,
  assignValetController,
  releaseValetController,
} from "../controllers/internal-valet.controller";

const router = Router();

router.post("/internal/resolve-garage", resolveGarage);
router.post("/internal/valets/register", registerValet);

router.get("/internal/valets/available/:garageId", getAvailableValetController);

router.post("/internal/valets/:valetId/assign", assignValetController);

router.post("/internal/valets/:valetId/release", releaseValetController);

export default router;
