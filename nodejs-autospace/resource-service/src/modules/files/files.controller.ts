import { Request, Response } from "express";
import { R2 } from "../../lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function generateUploadUrl(req: Request, res: Response) {
  const { filename, contentType } = req.body;

  if (!filename || !contentType) {
    return res.status(400).json({ error: "Missing filename or contentType" });
  }

  const key = `garages/${Date.now()}-${filename}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  try {
    const uploadUrl = await getSignedUrl(R2, command, { expiresIn: 300 });
    res.json({ uploadUrl, key });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
}
