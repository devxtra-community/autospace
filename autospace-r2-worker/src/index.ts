export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    // Only allow POST
    if (req.method !== "POST") {
      return new Response("Not allowed", { status: 405 });
    }

    // Only /upload endpoint
    const url = new URL(req.url);
    if (url.pathname !== "/upload") {
      return new Response("Not found", { status: 404 });
    }

    // Expect multipart/form-data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const key = formData.get("key") as string;

    if (!file || !key) {
      return new Response("Missing file or key", { status: 400 });
    }

    // Upload to R2
    await env.R2_BUCKET.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
    });

    return Response.json({
      success: true,
      key,
    });
  },
};

interface Env {
  R2_BUCKET: R2Bucket;
}
