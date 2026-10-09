import { put } from "@vercel/blob";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { cleanEnvSecret } from "@/lib/env";
import type { DemoKit } from "@/lib/website/demo-kits";
import type { DecorativeImageAssets } from "./decorative-images";

async function uploadPublicKitFile(
  ownerId: string,
  kind: string,
  publicPath: string,
): Promise<string | null> {
  const token = cleanEnvSecret(process.env.BLOB_READ_WRITE_TOKEN);
  if (!token) return null;
  const relative = publicPath.replace(/^\//, "");
  const abs = path.join(process.cwd(), "public", relative);
  try {
    const bytes = await readFile(abs);
    const ext = path.extname(abs).replace(".", "") || "png";
    const contentType = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : "image/png";
    const blob = await put(
      `storefronts/${ownerId}/style-kit/${kind}-${Date.now()}.${ext}`,
      bytes,
      { access: "public", token, contentType },
    );
    return blob.url;
  } catch (err) {
    console.error(
      "[website-ai] kit image upload failed",
      publicPath,
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

/**
 * Materialise kit hero + place images for the seller draft.
 * Prefers blob copies; falls back to public /demo/kits paths as editable starters.
 */
export async function materializeKitStarterImages(
  kit: DemoKit,
  ownerId: string,
): Promise<DecorativeImageAssets> {
  const [heroBlob, storyBlob] = await Promise.all([
    uploadPublicKitFile(ownerId, "hero", kit.images.heroWide),
    uploadPublicKitFile(ownerId, "story", kit.images.place),
  ]);
  return {
    heroUrl: heroBlob ?? kit.images.heroWide,
    storyUrl: storyBlob ?? kit.images.place,
    heroAlt: `${kit.placeholderName} hero`,
    storyAlt: `${kit.placeholderName} place`,
  };
}
