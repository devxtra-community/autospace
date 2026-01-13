import { Router } from "express";
import { register } from "../controllers/register.controller";
import { login } from "../controllers/login.controller";
import { validateRegister, validateLogin } from "../validators/auth.validator";
import { protectedRoute } from "../services/auth.service";

// import { authMiddleware } from "../../../../../api-gateway/src/middleware/auth.middleware.js"
// import { rbac } from "../../../middlewares/rbac.middleware";
// import { UserRole } from "../constants";

const router = Router();

router.get("/protected", protectedRoute);

// Temp test route
// // router.get(
// //   "/admin-only",
// //   authMiddleware,
// //   rbac(UserRole.ADMIN),
// //   (req, res) => {
// //     res.json({ message: "Admin access granted" });
// //   }
// // );

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);

export default router;
