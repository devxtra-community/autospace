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

const router = Router();

router.post("/create", validateCreateCompany, registerCompany);

router.put("/admin/companies/:id/active", approveCompany);
router.put("/admin/companies/:id/reject", rejectCompany);
router.get("/admin/companies", getPendingCompanies);
router.get("/my", getMyCompany);

export default router;
