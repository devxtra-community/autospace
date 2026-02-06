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
} from "../controllers/admin.garage.controller";
import { getPublicGarageController } from "../controllers/public.garage.controller";
import {
  addGarageImageController,
  getGarageImagesController,
} from "../controllers/garage-image.controller";
import {
  createGarageSlotController,
  getSlotController,
} from "../controllers/garage-slot.controller";
import {
  createGarageFloorController,
  getMyFloorsController,
} from "../controllers/garage-floor.controller";
import { internalAuth } from "../../../middlewares/internalAuth.middleware";

const router = Router();

router.post(
  "/register",
  internalAuth,
  validateCreateGarage,
  createGarageController,
);

router.get(
  "/",
  internalAuth,
  validatePublicGarageQuery,
  getPublicGarageController,
);
router.put("/admin/:id/active", internalAuth, approveGarage);
router.put("/admin/:id/reject", internalAuth, rejectGarage);
router.get("/admin/pending", internalAuth, getPendingGarages);
router.post("/assign-manager", internalAuth, assignManagerController);
router.get("/admin/all", internalAuth, getAllGaragesController);
router.get(
  "/byCompany/:companyId",
  internalAuth,
  getGaragesByCompanyController,
);
router.put("/:id", internalAuth, updateGarageProfileController);
router.post("/:garageId/images", internalAuth, addGarageImageController);
router.get("/:garageId/images", internalAuth, getGarageImagesController);

// slots
router.post(
  "/slots",
  validateCreateSlot,
  internalAuth,
  createGarageSlotController,
);

router.get("/slots/my", internalAuth, getSlotController);

//floor
router.post(
  "/floors",
  validateCreateFloor,
  internalAuth,
  createGarageFloorController,
);
router.get("/floors/my", internalAuth, getMyFloorsController);

export default router;
