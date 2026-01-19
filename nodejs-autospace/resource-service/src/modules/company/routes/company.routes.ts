import { Router } from "express";
import {
  getMyCompany,
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
// router.put("/admin/companies/:id/active", approveCompany);
// router.put("/admin/companies/:id/reject", rejectCompany);
// router.get("/admin/companies", getPendingCompanies);
router.get("/my", getMyCompany);
// router.post("/", validateCreateCompany, registerCompany);
router.put("/admin/:id/active", approveCompany);
router.put("/admin/:id/reject", rejectCompany);
router.get("/admin/", getPendingCompanies);

// internal (service-to-service)
router.get(
  "/internal/brn/:brn/validate",
  (req, res, next) => {
    next();
  },
  validateCompany,
);

export default router;
