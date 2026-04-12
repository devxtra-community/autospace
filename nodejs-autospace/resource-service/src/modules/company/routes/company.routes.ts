import { Router } from "express";
import {
  getMyCompany,
  getAllCompaniesController,
  // getCompanyDetails,
  registerCompany,
  updateCompanyProfileController,
} from "../controllers/company.controller";
import {
  approveCompany,
  rejectCompany,
} from "../controllers/admin.company.controller";
import { validateCreateCompany } from "../validators/company.validator";
import { getPendingCompanies } from "../controllers/admin.company.controller";
import { validateCompany } from "../controllers/internal.company.controller";
import { getCompanyEmployeesController } from "../controllers/companyEmployee.controller";
import {
  identityAuth,
  internalAuth,
} from "../../../middlewares/internalAuth.middleware";

const router = Router();

router.post("/create", identityAuth, validateCreateCompany, registerCompany);
router.get("/my", identityAuth, getMyCompany);

router.get("/admin/all", identityAuth, getAllCompaniesController);
router.put("/admin/:id/active", identityAuth, approveCompany);
router.put("/admin/:id/reject", identityAuth, rejectCompany);
router.get("/admin/pending", identityAuth, getPendingCompanies);
router.put("/:id", identityAuth, updateCompanyProfileController);
router.get(
  "/:companyId/employees",
  identityAuth,
  getCompanyEmployeesController,
);

// internal (resource service-to- auth service) check is company approved while manager registers

router.get(
  "/internal/brn/:brn/validate",
  (req, res, next) => {
    next();
  },
  validateCompany,
);

export default router;
