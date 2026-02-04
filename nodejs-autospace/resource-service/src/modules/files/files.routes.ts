import { Router } from "express";
import multer from "multer";
import {
  uploadFileController,
  downloadFileController,
} from "./files.controller";

const router = Router();
const upload = multer(); // memory storage

router.post("/upload", upload.single("file"), uploadFileController);

router.get("/:id", downloadFileController);

export default router;
