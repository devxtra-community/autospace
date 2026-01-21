import { Router } from "express";
import { createSlotController } from "../controllers/slot.controller";
import { validateCreateSlot } from "../validators/slots.validators";

const router = Router();

router.post("/", validateCreateSlot, createSlotController);

export default router;
