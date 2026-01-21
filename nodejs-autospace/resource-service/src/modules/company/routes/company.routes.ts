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

router.get("/my", getMyCompany);

router.put("/admin/:id/active", approveCompany);
router.put("/admin/:id/reject", rejectCompany);
router.get("/admin/pending", getPendingCompanies);

// internal (service-to-service)
router.get(
  "/internal/brn/:brn/validate",
  (req, res, next) => {
    next();
  },
  validateCompany,
);

export default router;
