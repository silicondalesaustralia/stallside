import { put } from "@vercel/blob";
import { cleanEnvSecret } from "@/lib/env";
import { LOGO_IMAGE_MAX_BYTES } from "@/lib/image-upload-limits";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function uploadStandLogo(
  standId: string,
  file: File,
): Promise<string> {
  const token = cleanEnvSecret(process.env.BLOB_READ_WRITE_TOKEN);
  if (!token) {
    throw new Error(
      "Image upload is not configured (BLOB_READ_WRITE_TOKEN is missing).",
    );
  }

  const type = file.type || "application/octet-stream";
  if (!ALLOWED.has(type)) {
    throw new Error("Use a JPEG, PNG, or WebP image.");
  }
  if (file.size <= 0 || file.size > LOGO_IMAGE_MAX_BYTES) {
    throw new Error("Logo is too large after processing. Try another image.");
  }

  const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(0, 80) || "logo";
  const blob = await put(`stands/${standId}/${Date.now()}-${safeName}`, file, {
    access: "public",
    token,
    contentType: type,
  });
  return blob.url;
}
