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
import {
  createGarageSlotController,
  getSlotController,
  getSlotsByFloorController,
} from "../controllers/garage-slot.controller";
import {
  createGarageFloorController,
  getMyFloorsController,
} from "../controllers/garage-floor.controller";
import { internalAuth } from "../../../middlewares/internalAuth.middleware";
import {
  freeSlot,
  getAvailableSlots,
  getSingleSlotStatus,
  listSlotsByGarage,
  lockSlot,
  occupySlot,
  releaseSlot,
} from "../controllers/booking-slot.controller";

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
router.get("/:id", internalAuth, getGarageByIdController);
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

// internal routes

router.get(
  "/internal/slots/available/:garageId/:floorNumber",
  internalAuth,
  getAvailableSlots,
);

router.get("/internal/slots/:slotId/status", internalAuth, getSingleSlotStatus);

router.post("/internal/slots/:slotId/lock", internalAuth, lockSlot);
router.post("/internal/slots/:slotId/release", internalAuth, releaseSlot);
router.post("/internal/slots/:slotId/occupy", internalAuth, occupySlot);
router.post("/internal/slots/:slotId/free", internalAuth, freeSlot);
router.get(
  "/internal/garages/:garageId/slots",
  internalAuth,
  listSlotsByGarage,
);

//floor
router.post(
  "/floors",
  validateCreateFloor,
  internalAuth,
  createGarageFloorController,
);
router.get("/floors/my", internalAuth, getMyFloorsController);
router.get("/floors/:floorId/slots", internalAuth, getSlotsByFloorController);

export default router;
