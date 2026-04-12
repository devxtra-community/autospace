import { Router } from "express";

import {
  validateGetValetsByGarage,
  validateValetIdParam,
} from "../validators/valets.validator";
import {
  approveValetController,
  getMyValetController,
  rejectValetController,
} from "../controllers/valet.controller";
import {
  getAvailableValetForUser,
  getCompanyValetsController,
  getPendingValetsController,
  getValetByIdController,
  getValetsByGarageController,
} from "../controllers/valetGarage.controller";
import { identityAuth } from "../../../middlewares/internalAuth.middleware";
import { getAllActiveValetsController } from "../controllers/internal-valet.controller";
// import { getAvailableValetController } from "../controllers/internal-valet.controller";

const router = Router();

router.use(identityAuth); // Use identityAuth instead of internalAuth for user-facing routes
router.get("/me", getMyValetController);
router.put(
  "/:id/manager/approve",
  validateValetIdParam,
  approveValetController,
);
router.put("/:id/manager/reject", validateValetIdParam, rejectValetController);
router.get("/pending", getPendingValetsController);

router.get("/garage/:garageId/valets/active", getAvailableValetForUser);

router.get(
  "/garage/:garageId",
  validateGetValetsByGarage,
  getValetsByGarageController,
);

router.get(
  "/company/:companyId",
  validateGetValetsByGarage,
  getCompanyValetsController,
);

router.get("/:id", validateValetIdParam, getValetByIdController);

router.get("/all-active/:garageId", getAllActiveValetsController);

export default router;
