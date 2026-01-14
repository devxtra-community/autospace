import { Router } from "express";
import { ownerSignup } from "../controllers/owner.controller";

const router = Router();

router.post("/register", ownerSignup);

export default router;
