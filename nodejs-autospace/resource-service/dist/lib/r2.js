"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.R2 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
if (!accessKeyId || !secretAccessKey) {
    throw new Error("Missing R2 credentials in environment");
}
exports.R2 = new client_s3_1.S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});
