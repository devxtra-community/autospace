"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const owner_controller_1 = require("../controllers/owner.controller");
const router = (0, express_1.Router)();
router.post("/register", owner_controller_1.ownerSignup);
exports.default = router;
