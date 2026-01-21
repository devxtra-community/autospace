import { Router } from "express";
import {
  assignManagerController,
  createGarageController,
  getGaragesByCompanyController,
} from "../controllers/garage.controller";
import { validateCreateGarage } from "../validators/garage.validator";
import {
  getPendingGarages,
  approveGarage,
  rejectGarage,
  getAllGaragesController,
  getGarageByIdController,
} from "../controllers/admin.garage.controller";

const router = Router();

router.post("/", validateCreateGarage, createGarageController);
router.put("/admin/:id/active", approveGarage);
router.put("/admin/:id/reject", rejectGarage);
router.get("/admin/pending", getPendingGarages);
router.post("/assign-manager", assignManagerController);
router.get("/:id", getGarageByIdController);
router.get("/admin/all", getAllGaragesController);
router.get("/byCompany/:companyId", getGaragesByCompanyController);

export default router;
