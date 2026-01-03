import { Router } from "express";
import { register } from "../controllers/auth.controller";
import { protectedRoute } from "../services/auth.service";
import { authMiddleware } from "../../../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.get("/protected", authMiddleware, protectedRoute);

export default router;
