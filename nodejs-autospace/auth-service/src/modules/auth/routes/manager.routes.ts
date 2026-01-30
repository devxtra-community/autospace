import { Router } from "express";
import { managerSignup } from "../controllers/manager.controller";
import { validateManagerRegister } from "../validators/manager.validator";
import {
  getManagerInternal,
  assignManagerInternal,
  getAssignableManagers,
} from "../controllers/manager.controller";

const router = Router();

router.post("/register", validateManagerRegister, managerSignup);

// Internal (called by resource-service)
router.get("/internal/:id", getManagerInternal);
router.post("/internal/:id/assign", assignManagerInternal);
router.get(
  "/internal/companies/:companyId/managers/assignable",
  getAssignableManagers,
);

export default router;
