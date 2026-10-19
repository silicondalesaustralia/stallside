import { put } from "@vercel/blob";
import { cleanEnvSecret } from "@/lib/env";
import { LOGO_IMAGE_MAX_BYTES } from "@/lib/image-upload-limits";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

/** Upload an author photo to public blob storage and return its URL. */
export async function uploadAuthorAvatar(authorId: string, file: File): Promise<string> {
  const token = cleanEnvSecret(process.env.BLOB_READ_WRITE_TOKEN);
  if (!token) throw new Error("Image upload is not configured (BLOB_READ_WRITE_TOKEN is missing).");
  const type = file.type || "application/octet-stream";
  if (!ALLOWED.has(type)) throw new Error("Use a JPEG, PNG, or WebP photo.");
  if (file.size <= 0 || file.size > LOGO_IMAGE_MAX_BYTES) {
    throw new Error("Photo is too large. Use one under 900 KB.");
  }
  const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(0, 80) || "avatar";
  const blob = await put(`blog/authors/${authorId}/${Date.now()}-${safeName}`, file, {
    access: "public",
    token,
    contentType: type,
  });
  return blob.url;
}
