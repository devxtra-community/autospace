export async function uploadToWorker(
  fileBuffer: Buffer,
  filename: string,
  key: string,
  contentType: string,
) {
  const form = new FormData();

  form.append(
    "file",
    new Blob([new Uint8Array(fileBuffer)], { type: contentType }),
    filename,
  );

  form.append("key", key);

  const res = await fetch(`${process.env.R2_WORKER_UPLOAD_URL}/upload`, {
    method: "POST",
    headers: {
      "x-internal-auth": "autospace-internal-secret",
    },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Worker upload failed: ${text}`);
  }

  return res.json();
}
