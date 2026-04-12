import { Router } from "express";

import {
  generateUploadUrl,
  createFileRecord,
  getFileById,
} from "./files.controller";
import {
  identityAuth,
  internalAuth,
} from "../../middlewares/internalAuth.middleware";

const router = Router();
router.post("/upload", identityAuth, generateUploadUrl);
router.post("/", identityAuth, createFileRecord);
router.get("/:id", identityAuth, getFileById);

export default router;
