import { Router } from "express";
import { managerSignup } from "../controllers/manager.controller";
import { validateManagerRegister } from "../validators/manager.validator";

const router = Router();

router.post("/register", validateManagerRegister, managerSignup);

export default router;
