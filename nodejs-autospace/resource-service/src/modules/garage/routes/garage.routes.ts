import { Router } from "express";
import { createGarageController } from "../controllers/garage.controller";
import { validateCreateGarage } from "../validators/garage.validator";

const router = Router();

router.post("/", validateCreateGarage, createGarageController);

export default router;
