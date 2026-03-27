"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUploadUrl = generateUploadUrl;
exports.createFileRecord = createFileRecord;
exports.getFileById = getFileById;
const r2_1 = require("../../lib/r2");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const data_source_1 = require("../../db/data-source");
const files_entity_1 = require("./files.entity");
async function generateUploadUrl(req, res) {
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
        const command = new client_s3_1.PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
        });
        const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(r2_1.R2, command, {
            expiresIn: 300,
        });
        return res.json({ uploadUrl, key });
    }
    catch (err) {
        console.error("R2 SIGN ERROR", err);
        return res.status(500).json({ error: "Failed to generate upload URL" });
    }
}
async function createFileRecord(req, res) {
    const { key, mimeType, size } = req.body;
    if (!key || !mimeType || size == null) {
        return res
            .status(400)
            .json({ error: "key, mimeType, and size are required" });
    }
    const repo = data_source_1.AppDataSource.getRepository(files_entity_1.FileEntity);
    const file = await repo.save({
        key,
        mimeType,
        size,
    });
    return res.json(file);
}
async function getFileById(req, res) {
    const id = req.params.id;
    const file = await data_source_1.AppDataSource.getRepository(files_entity_1.FileEntity).findOneBy({ id });
    if (!file) {
        return res.status(404).json({ message: "File not found" });
    }
    const publicUrl = `${process.env.R2_PUBLIC_BASE_URL}/${file.key}`;
    return res.json({
        id: file.id,
        url: publicUrl,
    });
}
