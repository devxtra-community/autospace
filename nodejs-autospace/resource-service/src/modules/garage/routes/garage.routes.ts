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
  blockGarage,
  unblockGarage,
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
import {
  identityAuth,
  internalAuth,
} from "../../../middlewares/internalAuth.middleware";
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
  identityAuth,
  validateCreateGarage,
  createGarageController,
);

router.get("/", validatePublicGarageQuery, getPublicGarageController);

router.put("/admin/:id/active", identityAuth, approveGarage);
router.put("/admin/:id/reject", identityAuth, rejectGarage);
router.patch("/admin/:id/block", identityAuth, blockGarage);
router.patch("/admin/:id/unblock", identityAuth, unblockGarage);
router.get("/admin/pending", identityAuth, getPendingGarages);
router.post("/assign-manager", identityAuth, assignManagerController);
router.get("/admin/all", identityAuth, getAllGaragesController);

router.get(
  "/byCompany/:companyId",
  identityAuth,
  getGaragesByCompanyController,
);

router.put("/:id", identityAuth, updateGarageProfileController);
router.post("/:garageId/images", identityAuth, addGarageImageController);
router.get("/:garageId/images", identityAuth, getGarageImagesController);
router.get("/manager/my", identityAuth, getMyManagerGarageController);

router.get("/:id", identityAuth, getGarageByIdController);
// slots
router.post(
  "/slots",
  validateCreateSlot,
  identityAuth,
  createGarageSlotController,
);

router.get("/slots/my", identityAuth, getSlotController);

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
  identityAuth,
  createGarageFloorController,
);
router.get("/floors/my", identityAuth, getMyFloorsController);
router.get("/floors/:floorId/slots", identityAuth, getSlotsByFloorController);

// user side

router.get("/:garageId/slots", identityAuth, getPublicAvailableSlotsController);

export default router;
