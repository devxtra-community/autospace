"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const company_controller_1 = require("../controllers/company.controller");
const admin_company_controller_1 = require("../controllers/admin.company.controller");
const company_validator_1 = require("../validators/company.validator");
const admin_company_controller_2 = require("../controllers/admin.company.controller");
const internal_company_controller_1 = require("../controllers/internal.company.controller");
const companyEmployee_controller_1 = require("../controllers/companyEmployee.controller");
const internalAuth_middleware_1 = require("../../../middlewares/internalAuth.middleware");
const router = (0, express_1.Router)();
router.post("/create", internalAuth_middleware_1.identityAuth, company_validator_1.validateCreateCompany, company_controller_1.registerCompany);
router.get("/my", internalAuth_middleware_1.identityAuth, company_controller_1.getMyCompany);
router.get("/admin/all", internalAuth_middleware_1.identityAuth, company_controller_1.getAllCompaniesController);
router.put("/admin/:id/active", internalAuth_middleware_1.identityAuth, admin_company_controller_1.approveCompany);
router.put("/admin/:id/reject", internalAuth_middleware_1.identityAuth, admin_company_controller_1.rejectCompany);
router.get("/admin/pending", internalAuth_middleware_1.identityAuth, admin_company_controller_2.getPendingCompanies);
router.put("/:id", internalAuth_middleware_1.identityAuth, company_controller_1.updateCompanyProfileController);
router.get("/:companyId/employees", internalAuth_middleware_1.identityAuth, companyEmployee_controller_1.getCompanyEmployeesController);
// internal (resource service-to- auth service) check is company approved while manager registers
router.get("/internal/brn/:brn/validate", (req, res, next) => {
    next();
}, internal_company_controller_1.validateCompany);
exports.default = router;
