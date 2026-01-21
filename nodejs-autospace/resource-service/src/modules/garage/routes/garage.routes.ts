import { Router } from "express";
import {
  assignManagerController,
  createGarageController,
} from "../controllers/garage.controller";
import { validateCreateGarage } from "../validators/garage.validator";
import {
  getPendingGarages,
  approveGarage,
  rejectGarage,
} from "../controllers/admin.garage.controller";

const router = Router();

router.post("/", validateCreateGarage, createGarageController);
router.put("/admin/:id/active", approveGarage);
router.put("/admin/:id/reject", rejectGarage);
router.get("/admin/pending", getPendingGarages);
router.post("/assign-manager", assignManagerController);

export default router;
