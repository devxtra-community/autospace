import { Router } from "express";
import { register } from "../controllers/register.controller";
import { login } from "../controllers/login.controller";
import { validateRegister, validateLogin } from "../validators/auth.validator";
import { protectedRoute } from "../services/auth.service";
import { refresh } from "../controllers/refresh.controller";
import {
  forgotPassword,
  Logout,
  resetPassword,
} from "../controllers/logout.controller";
import { registerValet } from "../controllers/valet.controller";
import { validateUpdateProfile } from "../validators/auth.validator";
import {
  getAllUsers,
  getMyProfileController,
  updateAmdinUsers,
  updateProfileController,
} from "../controllers/user.controller";
import { validateGetAllUsersQuery } from "../validators/user.validator";
import { getUserLoginStatsController } from "../controllers/owner.controller";
import { googleLogin } from "../controllers/google-login.controller";

// import { authMiddleware } from "../../../../../api-gateway/src/middleware/auth.middleware.js"
// import { rbac } from "../../../middlewares/rbac.middleware";
// import { UserRole } from "../constants";

const router = Router();

router.get("/protected", protectedRoute);

router.post("/refresh", refresh);
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/google", googleLogin);
router.post("/logout", Logout);
router.post("/forget-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/valet/register", registerValet);
router.get("/profile/my", getMyProfileController);
router.patch("/profile/my", validateUpdateProfile, updateProfileController);
router.get("/admin/allusers", validateGetAllUsersQuery, getAllUsers);
router.patch("/admin/update/user/:userId", updateAmdinUsers);
router.get("/admin/user/stats", getUserLoginStatsController);

export default router;
