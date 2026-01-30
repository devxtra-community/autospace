import { Request, Response } from "express";
import { uploadToWorker } from "../../lib/workerUpload";

export const uploadFileController = async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const key = `uploads/${Date.now()}-${file.originalname}`;

  const result = await uploadToWorker(
    file.buffer,
    file.originalname,
    key,
    file.mimetype,
  );

  res.json(result);
};
