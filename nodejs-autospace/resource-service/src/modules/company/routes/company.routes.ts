import { Router } from "express";
import { registerCompany } from "../controllers/company.controller";
import { validateCreateCompany } from "../validators/company.validator";
import { getPendingCompanies } from "../controllers/admin.company.controller";

const router = Router();

router.post("/", validateCreateCompany, registerCompany);
router.get("/admin/companies", getPendingCompanies);

export default router;
