"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const company_controller_1 = require("../controllers/company.controller");
const company_validator_1 = require("../validators/company.validator");
const router = (0, express_1.Router)();
router.post("/", company_validator_1.validateCreateCompany, company_controller_1.registerCompany);
exports.default = router;
