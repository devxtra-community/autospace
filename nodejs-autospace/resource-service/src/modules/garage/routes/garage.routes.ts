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
import { internalAuth } from "../../../middlewares/internalAuth.middleware";

const router = Router();

router.use((req, _res, next) => {
  console.log(" RESOURCE ROUTE HIT:", req.method, req.originalUrl);
  next();
});

router.post(
  "/register",
  internalAuth,
  validateCreateGarage,
  createGarageController,
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
router.get("/:id", internalAuth, getGarageByIdController);
router.put("/:id", internalAuth, updateGarageProfileController);
router.post("/:garageId/images", internalAuth, addGarageImageController);
router.get("/:garageId/images", internalAuth, getGarageImagesController);
router.post(
  "/slots",
  validateCreateSlot,
  internalAuth,
  createGarageSlotController,
);
router.post(
  "/floors",
  validateCreateFloor,
  internalAuth,
  createGarageFloorController,
);

export default router;
