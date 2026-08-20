import { put } from "@vercel/blob";
import { cleanEnvSecret } from "@/lib/env";
import { GALLERY_IMAGE_MAX_BYTES } from "@/lib/image-upload-limits";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function uploadGalleryImage(file: File): Promise<string> {
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
  if (file.size <= 0 || file.size > GALLERY_IMAGE_MAX_BYTES) {
    throw new Error("Image is too large after processing. Try another photo.");
  }

  const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(0, 80) || "stand";
  const blob = await put(`gallery/${Date.now()}-${safeName}`, file, {
    access: "public",
    token,
    contentType: type,
  });
  return blob.url;
}
