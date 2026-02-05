import { Router } from "express";
import {
  assignManagerController,
  createGarageController,
  getGaragesByCompanyController,
  updateGarageProfileController,
} from "../controllers/garage.controller";
import {
  validateCreateFloor,
  validateCreateGarage,
  validateCreateSlot,
  validatePublicGarageQuery,
} from "../validators/garage.validator";
import {
  getPendingGarages,
  approveGarage,
  rejectGarage,
  getAllGaragesController,
  getGarageByIdController,
} from "../controllers/admin.garage.controller";
import { getPublicGarageController } from "../controllers/public.garage.controller";
import {
  addGarageImageController,
  getGarageImagesController,
} from "../controllers/garage-image.controller";
import { createGarageSlotController } from "../controllers/garage-slot.controller";
import { createGarageFloorController } from "../controllers/garage-floor.controller";

const router = Router();

router.get("/", validatePublicGarageQuery, getPublicGarageController);
router.get("/:id", getGarageByIdController);
router.post("/register", validateCreateGarage, createGarageController);
router.put("/admin/:id/active", approveGarage);
router.put("/admin/:id/reject", rejectGarage);
router.get("/admin/pending", getPendingGarages);
router.post("/assign-manager", assignManagerController);
router.get("/admin/all", getAllGaragesController);
router.get("/byCompany/:companyId", getGaragesByCompanyController);
router.put("/:id", updateGarageProfileController);
router.post("/:garageId/images", addGarageImageController);
router.get("/:garageId/images", getGarageImagesController);
router.post("/slots", validateCreateSlot, createGarageSlotController);
router.post("/floors", validateCreateFloor, createGarageFloorController);

export default router;
