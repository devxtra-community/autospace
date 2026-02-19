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
  getCompanyValetsController,
  getPendingValetsController,
  getValetByIdController,
  getValetsByGarageController,
} from "../controllers/valetGarage.controller";
import { internalAuth } from "../../../middlewares/internalAuth.middleware";

const router = Router();

router.use(internalAuth); // Apply internal authentication middleware to all routes in this router
router.get("/me", getMyValetController);
router.put(
  "/:id/manager/approve",
  validateValetIdParam,
  approveValetController,
);
router.put("/:id/manager/reject", validateValetIdParam, rejectValetController);
router.get("/pending", getPendingValetsController);
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

export default router;
