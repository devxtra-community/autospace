import { Router } from "express";
import multer from "multer";
import { uploadFileController } from "./files.controller";

const router = Router();
const upload = multer(); // memory storage

router.post("/upload", upload.single("file"), uploadFileController);

export default router;
