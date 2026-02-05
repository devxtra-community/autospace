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
import { internalAuth } from "../../../middlewares/internalAuth.middleware";

const router = Router();

router.post("/create", internalAuth, validateCreateCompany, registerCompany);
router.get("/my", internalAuth, getMyCompany);

router.get("/admin/all", internalAuth, getAllCompaniesController);
router.put("/admin/:id/active", internalAuth, approveCompany);
router.put("/admin/:id/reject", internalAuth, rejectCompany);
router.get("/admin/pending", internalAuth, getPendingCompanies);
router.put("/:id", internalAuth, updateCompanyProfileController);

// internal (resource service-to- auth service) check is company approved while manager registers

router.get(
  "/internal/brn/:brn/validate",
  (req, res, next) => {
    next();
  },
  validateCompany,
);

export default router;
