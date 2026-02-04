const INTERNAL_SECRET = "autospace-internal-secret";

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);

    if (req.method === "GET" && url.pathname.startsWith("/files/")) {
      const key = url.pathname.replace("/files/", "");

      const object = await env.R2_BUCKET.get(key);
      if (!object) {
        return new Response("Not found", { status: 404 });
      }

      return new Response(object.body, {
        headers: {
          "Content-Type":
            object.httpMetadata?.contentType ?? "application/octet-stream",
        },
      });
    }

    if (req.method !== "POST") {
      return new Response("Not allowed", { status: 405 });
    }

    // Internal auth (backend to worker only)
    const authHeader = req.headers.get("x-internal-auth");
    if (authHeader !== INTERNAL_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Only /upload endpoint
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
