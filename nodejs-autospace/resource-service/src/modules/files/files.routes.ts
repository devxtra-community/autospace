import { Router } from "express";

import {
  generateUploadUrl,
  createFileRecord,
  getFileById,
} from "./files.controller";
import { internalAuth } from "../../middlewares/internalAuth.middleware";

const router = Router();
router.post("/upload", internalAuth, generateUploadUrl);
router.post("/", internalAuth, createFileRecord);
router.get("/:id", internalAuth, getFileById);

export default router;
