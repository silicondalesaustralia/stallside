import { put } from "@vercel/blob";
import { cleanEnvSecret } from "@/lib/env";
import { LOGO_IMAGE_MAX_BYTES } from "@/lib/image-upload-limits";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/x-icon", "image/vnd.microsoft.icon"]);

async function uploadStorefrontAsset(
  ownerId: string,
  kind: "logo" | "favicon",
  file: File,
): Promise<string> {
  const token = cleanEnvSecret(process.env.BLOB_READ_WRITE_TOKEN);
  if (!token) {
    throw new Error(
      "Image upload is not configured (BLOB_READ_WRITE_TOKEN is missing).",
    );
  }

  const type = file.type || "application/octet-stream";
  if (!ALLOWED.has(type) && kind === "logo") {
    throw new Error("Use a JPEG, PNG, or WebP image.");
  }
  if (kind === "favicon" && !ALLOWED.has(type) && !type.includes("icon")) {
    throw new Error("Use a PNG, WebP, or ICO favicon.");
  }
  if (file.size <= 0 || file.size > LOGO_IMAGE_MAX_BYTES) {
    throw new Error("Image is too large. Try another file.");
  }

  const safeName =
    file.name.replace(/[^\w.\-]+/g, "_").slice(0, 80) || kind;
  const blob = await put(
    `storefronts/${ownerId}/${kind}-${Date.now()}-${safeName}`,
    file,
    { access: "public", token, contentType: type },
  );
  return blob.url;
}

export function uploadStorefrontLogo(ownerId: string, file: File) {
  return uploadStorefrontAsset(ownerId, "logo", file);
}

export function uploadStorefrontFavicon(ownerId: string, file: File) {
  return uploadStorefrontAsset(ownerId, "favicon", file);
}
