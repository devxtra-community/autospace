import { Router } from "express";
import { createGarageController } from "../controllers/garage.controller";
import { validateCreateGarage } from "../validators/garage.validator";
import {
  getPendingGarages,
  approveGarage,
  rejectGarage,
} from "../controllers/admin.garage.controller";

const router = Router();

router.post("/", validateCreateGarage, createGarageController);
router.put("/admin/garages/:id/active", approveGarage);
router.put("/admin/garages/:id/reject", rejectGarage);
router.get("/admin/garages", getPendingGarages);

export default router;
