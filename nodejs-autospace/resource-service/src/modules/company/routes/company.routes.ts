import { Router } from "express";
import {
  getMyCompany,
  getAllCompaniesController,
  getCompanyDetails,
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

const router = Router();

router.post("/create", validateCreateCompany, registerCompany);
router.get("/my", getMyCompany);

router.get("/admin/all", getAllCompaniesController);
router.get("/admin/pending", getPendingCompanies);
router.put("/admin/:id/active", approveCompany);
router.put("/admin/:id/reject", rejectCompany);
router.get("/:id", getCompanyDetails);
router.put("/:id", updateCompanyProfileController);

// internal (resource service-to- auth service) check is company approved while manager registers

router.get(
  "/internal/brn/:brn/validate",
  (req, res, next) => {
    next();
  },
  validateCompany,
);

router.get("/:id", getCompanyDetails);

export default router;
