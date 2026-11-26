import { put } from "@vercel/blob";
import { cleanEnvSecret } from "@/lib/env";
import { PRODUCT_IMAGE_MAX_BYTES } from "@/lib/image-upload-limits";
import { prisma } from "@/lib/prisma";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
export const MEDIA_LIBRARY_MAX_ASSETS = 500;

type UploadOk = {
  ok: true;
  asset: { id: string; url: string; fileName: string };
};
type UploadErr = { ok: false; error: string };

/** Stores one photo in the owner's media library (Vercel Blob + DB row). */
export async function uploadMediaLibraryAsset(
  ownerId: string,
  file: File,
): Promise<UploadOk | UploadErr> {
  const token = cleanEnvSecret(process.env.BLOB_READ_WRITE_TOKEN);
  if (!token) {
    return { ok: false, error: "Image upload is not configured (BLOB_READ_WRITE_TOKEN is missing)." };
  }
  const type = file.type || "application/octet-stream";
  if (!ALLOWED.has(type)) return { ok: false, error: "Use a JPEG, PNG, or WebP image." };
  if (file.size <= 0 || file.size > PRODUCT_IMAGE_MAX_BYTES) {
    return { ok: false, error: "Image is too large after processing. Try another photo." };
  }

  const count = await prisma.mediaLibraryAsset.count({ where: { ownerId } });
  if (count >= MEDIA_LIBRARY_MAX_ASSETS) {
    return { ok: false, error: `You can keep up to ${MEDIA_LIBRARY_MAX_ASSETS} photos in the library.` };
  }

  const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(0, 80) || "photo";
  const blob = await put(
    `owners/${ownerId}/media/${Date.now()}-${safeName}`,
    file,
    { access: "public", token, contentType: type },
  );
  const asset = await prisma.mediaLibraryAsset.create({
    data: {
      ownerId,
      url: blob.url,
      fileName: file.name.slice(0, 200) || safeName,
      contentType: type,
      byteSize: file.size,
    },
    select: { id: true, url: true, fileName: true },
  });
  return { ok: true, asset };
}
