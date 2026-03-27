"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const manager_controller_1 = require("../controllers/manager.controller");
const manager_validator_1 = require("../validators/manager.validator");
const manager_controller_2 = require("../controllers/manager.controller");
const router = (0, express_1.Router)();
router.post("/register", manager_validator_1.validateManagerRegister, manager_controller_1.managerSignup);
// Internal (called by resource-service)
router.get("/internal/:id", manager_controller_2.getManagerInternal);
router.post("/internal/:id/assign", manager_controller_2.assignManagerInternal);
router.get("/internal/companies/:companyId/managers/assignable", manager_controller_2.getAssignableManagers);
exports.default = router;
