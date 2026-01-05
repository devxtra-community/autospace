import { Router } from "express";
import { register } from "../controllers/register.controller";
import { login } from "../controllers/login.controller";
import { validateRegister, validateLogin } from "../validators/auth.validator";
import { protectedRoute } from "../services/auth.service";
import { authMiddleware } from "../../../middlewares/auth.middleware";

const router = Router();

router.get("/protected", authMiddleware, protectedRoute);

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);

export default router;
