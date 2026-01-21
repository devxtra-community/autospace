import { Router } from "express";
import {
  resolveGarage,
  registerValet,
} from "../controllers/internal-valet.controller";

const router = Router();

router.post("/internal/resolve-garage", resolveGarage);
router.post("/internal/valets/register", registerValet);

export default router;
