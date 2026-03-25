import { Router } from "express";
import { validatePublicGarageQuery } from "../validators/garage.validator";
import {
  getPublicGarageById,
  getPublicGarageController,
} from "../controllers/public.garage.controller";
import { getGarageImagesController } from "../controllers/garage-image.controller";

const router = Router();

router.get(
  "/user/garages",
  validatePublicGarageQuery,
  getPublicGarageController,
);

router.get("/garages/:garageId/images", getGarageImagesController);

router.get("/user/garages/:garageId", getPublicGarageById);

export default router;
