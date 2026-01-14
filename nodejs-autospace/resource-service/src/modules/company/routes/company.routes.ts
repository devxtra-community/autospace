import { Router } from "express";
import { registerCompany } from "../controllers/company.controller";
import { validateCreateCompany } from "../validators/company.validator";

const router = Router();

router.post("/", validateCreateCompany, registerCompany);

export default router;
