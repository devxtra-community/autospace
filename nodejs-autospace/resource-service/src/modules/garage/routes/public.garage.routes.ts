import { Router } from "express";
import { validatePublicGarageQuery } from "../validators/garage.validator";
import {
  getPublicGarageById,
  getPublicGarageController,
} from "../controllers/public.garage.controller";

const router = Router();

router.get(
  "/user/garages",
  validatePublicGarageQuery,
  getPublicGarageController,
);

router.get("/user/garages/:garageId", getPublicGarageById);

export default router;
