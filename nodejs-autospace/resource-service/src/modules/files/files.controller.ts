import { Request, Response } from "express";
import { R2 } from "../../lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
