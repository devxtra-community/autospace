import { Router } from "express";

import {
  validateGetValetsByGarage,
  validateValetIdParam,
} from "../validators/valets.validator";
import {
  approveValetController,
  rejectValetController,
} from "../controllers/valet.controller";
import {
  getCompanyValetsController,
  getPendingValetsController,
  getValetByIdController,
  getValetsByGarageController,
} from "../controllers/valetGarage.controller";

const router = Router();

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
  "/company/:compoanyId",
  validateGetValetsByGarage,
  getCompanyValetsController,
);

router.get("/:id", validateValetIdParam, getValetByIdController);

export default router;
