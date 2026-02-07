import { Router } from "express";

import { generateUploadUrl } from "./files.controller";

const router = Router();
router.post("/upload", generateUploadUrl);

export default router;
