import { Request, Response } from "express";
import { uploadToWorker } from "../../lib/workerUpload";
import { AppDataSource } from "../../db/data-source";
import { FileEntity } from "./files.entity";

export const uploadFileController = async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  //  basic image-only validation
  if (!file.mimetype.startsWith("image/")) {
    return res.status(400).json({ message: "Only image uploads allowed" });
  }

  const key = `uploads/${Date.now()}-${file.originalname}`;

  // Upload to worker / R2
  await uploadToWorker(file.buffer, file.originalname, key, file.mimetype);

  // Save metadata in DB
  const fileRepo = AppDataSource.getRepository(FileEntity);

  const savedFile = await fileRepo.save({
    key,
    mimeType: file.mimetype,
    size: file.size,
  });

  //  Return DB record
  return res.status(201).json(savedFile);
};

export const downloadFileController = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const fileRepo = AppDataSource.getRepository(FileEntity);
  const file = await fileRepo.findOneBy({ id });

  if (!file) {
    return res.status(404).json({ message: "File not found" });
  }

  const fileUrl = `${process.env.R2_WORKER_UPLOAD_URL}/files/${file.key}`;

  return res.redirect(fileUrl);
};
