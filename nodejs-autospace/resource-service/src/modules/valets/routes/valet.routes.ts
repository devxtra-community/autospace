import { Router } from "express";

import {
  validateGetValetsByGarage,
  validateValetIdParam,
} from "../validators/valets.vzlidator";
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

router.put("/:id/approve", validateValetIdParam, approveValetController);
router.put("/:id/reject", validateValetIdParam, rejectValetController);
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
