import { Router } from "express";
import { validatePublicGarageQuery } from "../validators/garage.validator";
import { getPublicGarageController } from "../controllers/public.garage.controller";

const router = Router();

router.get(
  "/user/garages",
  validatePublicGarageQuery,
  getPublicGarageController,
);

export default router;
