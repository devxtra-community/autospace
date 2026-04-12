"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const garage_controller_1 = require("../controllers/garage.controller");
const garage_validator_1 = require("../validators/garage.validator");
const admin_garage_controller_1 = require("../controllers/admin.garage.controller");
const public_garage_controller_1 = require("../controllers/public.garage.controller");
const garage_image_controller_1 = require("../controllers/garage-image.controller");
const garage_slot_controller_1 = require("../controllers/garage-slot.controller");
const garage_floor_controller_1 = require("../controllers/garage-floor.controller");
const internalAuth_middleware_1 = require("../../../middlewares/internalAuth.middleware");
const booking_slot_controller_1 = require("../controllers/booking-slot.controller");
const router = (0, express_1.Router)();
router.use((req, _res, next) => {
    console.log(" RESOURCE ROUTE HIT:", req.method, req.originalUrl);
    next();
});
router.get("/internal/slots/:slotId/status", internalAuth_middleware_1.internalAuth, booking_slot_controller_1.getSingleSlotStatus);
router.post("/internal/slots/:slotId/lock", internalAuth_middleware_1.internalAuth, booking_slot_controller_1.lockSlot);
router.post("/internal/slots/:slotId/release", internalAuth_middleware_1.internalAuth, booking_slot_controller_1.releaseSlot);
router.post("/internal/slots/:slotId/occupy", internalAuth_middleware_1.internalAuth, booking_slot_controller_1.occupySlot);
router.post("/internal/slots/:slotId/free", internalAuth_middleware_1.internalAuth, booking_slot_controller_1.freeSlot);
router.get("/internal/garages/:garageId/slots", internalAuth_middleware_1.internalAuth, booking_slot_controller_1.listSlotsByGarage);
router.get("/internal/slots/:slotId", internalAuth_middleware_1.internalAuth, (req, res, next) => {
    console.log("CORRECT INTERNAL SLOT ROUTE HIT");
    next();
}, garage_slot_controller_1.getSlotByIdInternal);
// manager garageid for booking service
router.get("/internal/:managerId/garageId", internalAuth_middleware_1.internalAuth, garage_slot_controller_1.getGarageByManager);
router.post("/register", internalAuth_middleware_1.identityAuth, garage_validator_1.validateCreateGarage, garage_controller_1.createGarageController);
router.get("/", garage_validator_1.validatePublicGarageQuery, public_garage_controller_1.getPublicGarageController);
router.put("/admin/:id/active", internalAuth_middleware_1.identityAuth, admin_garage_controller_1.approveGarage);
router.put("/admin/:id/reject", internalAuth_middleware_1.identityAuth, admin_garage_controller_1.rejectGarage);
router.patch("/admin/:id/block", internalAuth_middleware_1.identityAuth, admin_garage_controller_1.blockGarage);
router.patch("/admin/:id/unblock", internalAuth_middleware_1.identityAuth, admin_garage_controller_1.unblockGarage);
router.get("/admin/pending", internalAuth_middleware_1.identityAuth, admin_garage_controller_1.getPendingGarages);
router.post("/assign-manager", internalAuth_middleware_1.identityAuth, garage_controller_1.assignManagerController);
router.get("/admin/all", internalAuth_middleware_1.identityAuth, admin_garage_controller_1.getAllGaragesController);
router.get("/byCompany/:companyId", internalAuth_middleware_1.identityAuth, garage_controller_1.getGaragesByCompanyController);
router.put("/:id", internalAuth_middleware_1.identityAuth, garage_controller_1.updateGarageProfileController);
router.post("/:garageId/images", internalAuth_middleware_1.identityAuth, garage_image_controller_1.addGarageImageController);
router.get("/:garageId/images", internalAuth_middleware_1.identityAuth, garage_image_controller_1.getGarageImagesController);
router.get("/manager/my", internalAuth_middleware_1.identityAuth, garage_controller_1.getMyManagerGarageController);
router.get("/:id", internalAuth_middleware_1.identityAuth, admin_garage_controller_1.getGarageByIdController);
// slots
router.post("/slots", garage_validator_1.validateCreateSlot, internalAuth_middleware_1.identityAuth, garage_slot_controller_1.createGarageSlotController);
router.get("/slots/my", internalAuth_middleware_1.identityAuth, garage_slot_controller_1.getSlotController);
// internal routes
router.get("/internal/slots/available/:garageId/:floorNumber", internalAuth_middleware_1.internalAuth, booking_slot_controller_1.getAvailableSlots);
//floor
router.post("/floors", garage_validator_1.validateCreateFloor, internalAuth_middleware_1.identityAuth, garage_floor_controller_1.createGarageFloorController);
router.get("/floors/my", internalAuth_middleware_1.identityAuth, garage_floor_controller_1.getMyFloorsController);
router.get("/floors/:floorId/slots", internalAuth_middleware_1.identityAuth, garage_slot_controller_1.getSlotsByFloorController);
// user side
router.get("/:garageId/slots", internalAuth_middleware_1.identityAuth, garage_slot_controller_1.getPublicAvailableSlotsController);
exports.default = router;
