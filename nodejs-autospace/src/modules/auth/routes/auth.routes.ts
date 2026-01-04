import { Router } from "express";
import { register } from "../controllers/register.controller";
import { login } from "../controllers/login.controller";
import { validateRegister, validateLogin } from "../validators/auth.validator";
import { protectedRoute } from "../services/auth.service";
import { authMiddleware } from "../../../middlewares/auth.middleware";

const router = Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/protected", authMiddleware, protectedRoute);

// import { register } from "../controllers/auth.controller";
// const router = Router();
// router.post("/register", register);

export default router;
