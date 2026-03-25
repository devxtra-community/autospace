import { Request, Response } from "express";
import { R2 } from "../../lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AppDataSource } from "../../db/data-source";
import { FileEntity } from "./files.entity";

export async function generateUploadUrl(req: Request, res: Response) {
  const { filename } = req.body;

  if (!filename || typeof filename !== "string") {
    return res.status(400).json({ error: "Invalid filename" });
  }

  const allowed = /\.(png|jpg|jpeg|webp)$/i;
  if (!allowed.test(filename)) {
    return res.status(400).json({ error: "Unsupported file type" });
  }

  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "");
  const key = `garages/${Date.now()}-${safeFilename}`;

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    });

    const uploadUrl = await getSignedUrl(R2, command, {
      expiresIn: 300,
    });

    return res.json({ uploadUrl, key });
  } catch (err) {
    console.error("R2 SIGN ERROR", err);
    return res.status(500).json({ error: "Failed to generate upload URL" });
  }
}

export async function createFileRecord(req: Request, res: Response) {
  const { key, mimeType, size } = req.body;

  if (!key || !mimeType || size == null) {
    return res
      .status(400)
      .json({ error: "key, mimeType, and size are required" });
  }

  const repo = AppDataSource.getRepository(FileEntity);

  const file = await repo.save({
    key,
    mimeType,
    size,
  });

  return res.json(file);
}

export async function getFileById(req: Request, res: Response) {
  const id = req.params.id as string;

  const file = await AppDataSource.getRepository(FileEntity).findOneBy({ id });

  if (!file) {
    return res.status(404).json({ message: "File not found" });
  }

  const publicUrl = `${process.env.R2_PUBLIC_BASE_URL}/${file.key}`;

  return res.json({
    id: file.id,
    url: publicUrl,
  });
}
