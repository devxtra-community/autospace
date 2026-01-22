import { Router } from "express";
import {
  getMyCompany,
  getAllCompaniesController,
  getCompanyDetails,
  registerCompany,
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

router.put("/admin/:id/active", approveCompany);
router.put("/admin/:id/reject", rejectCompany);
router.get("/admin/pending", getPendingCompanies);
router.get("/:id", getCompanyDetails);
router.get("/admin/all", getAllCompaniesController);

// internal (resource service-to- auth service) check is company approved while manager registers

router.get(
  "/internal/brn/:brn/validate",
  (req, res, next) => {
    next();
  },
  validateCompany,
);

export default router;
