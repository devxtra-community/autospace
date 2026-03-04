import { Router } from "express";
import {
  assignManagerController,
  createGarageController,
  getGaragesByCompanyController,
  getMyManagerGarageController,
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
  getGarageByManager,
  getPublicAvailableSlotsController,
  getSlotByIdInternal,
  getSlotController,
  getSlotsByFloorController,
  createGarageSlotController,
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

router.get(
  "/internal/slots/:slotId",
  internalAuth,
  (req, res, next) => {
    console.log("CORRECT INTERNAL SLOT ROUTE HIT");
    next();
  },
  getSlotByIdInternal,
);

// manager garageid for booking service

router.get("/internal/:managerId/garageId", internalAuth, getGarageByManager);

router.post(
  "/register",
  internalAuth,
  validateCreateGarage,
  createGarageController,
);

router.get("/", validatePublicGarageQuery, getPublicGarageController);

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
router.get("/manager/my", internalAuth, getMyManagerGarageController);

router.get("/:id", internalAuth, getGarageByIdController);
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

//floor
router.post(
  "/floors",
  validateCreateFloor,
  internalAuth,
  createGarageFloorController,
);
router.get("/floors/my", internalAuth, getMyFloorsController);
router.get("/floors/:floorId/slots", internalAuth, getSlotsByFloorController);

// user side

router.get("/:garageId/slots", internalAuth, getPublicAvailableSlotsController);

export default router;
