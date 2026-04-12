"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const internal_valet_controller_1 = require("../controllers/internal-valet.controller");
const valet_controller_1 = require("../controllers/valet.controller");
const internalAuth_middleware_1 = require("../../../middlewares/internalAuth.middleware");
const router = (0, express_1.Router)();
router.use(internalAuth_middleware_1.internalAuth); // Strictly enforce internal service token for all internal routes
router.post("/resolve-garage", internal_valet_controller_1.resolveGarage);
router.post("/register", internal_valet_controller_1.registerValet);
router.get("/me", valet_controller_1.getMyValetController);
router.get("/available/:garageId", internal_valet_controller_1.getAvailableValetController);
router.patch("/:valetId/assign", internal_valet_controller_1.assignValetController);
router.patch("/:valetId/reject", internal_valet_controller_1.rejectBookingController);
router.patch("/:valetId/release", internal_valet_controller_1.releaseValetController);
exports.default = router;
