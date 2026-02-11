import { Router } from "express";

import { generateUploadUrl, createFileRecord } from "./files.controller";
import { internalAuth } from "../../middlewares/internalAuth.middleware";

const router = Router();
router.post("/upload", internalAuth, generateUploadUrl);
router.post("/", internalAuth, createFileRecord);

export default router;
