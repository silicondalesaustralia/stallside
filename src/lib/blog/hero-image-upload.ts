import { put } from "@vercel/blob";
import { cleanEnvSecret } from "@/lib/env";
import { slugifyBlogTitle } from "./slug";

/** Server Action body limit is 6 MB (next.config.ts); leave room for the rest of the form. */
export const HERO_IMAGE_MAX_BYTES = 4 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Upload a blog hero image to blog/{post-slug}/ in public blob storage and return its URL. */
export async function uploadBlogHeroImage(postSlug: string, file: File): Promise<string> {
  const token = cleanEnvSecret(process.env.BLOB_READ_WRITE_TOKEN);
  if (!token) throw new Error("Image upload is not configured (BLOB_READ_WRITE_TOKEN is missing).");
  const type = file.type || "application/octet-stream";
  const ext = EXTENSIONS[type];
  if (!ext) throw new Error("Use a JPEG, PNG, or WebP hero image.");
  if (file.size <= 0 || file.size > HERO_IMAGE_MAX_BYTES) {
    throw new Error("Hero image is too large. Use one under 4 MB.");
  }
  const folder = slugifyBlogTitle(postSlug) || "post";
  const name = slugifyBlogTitle(file.name.replace(/\.[^.]+$/, "")) || "hero";
  const blob = await put(`blog/${folder}/${name}-${Date.now()}.${ext}`, file, {
    access: "public",
    token,
    contentType: type,
  });
  return blob.url;
}
