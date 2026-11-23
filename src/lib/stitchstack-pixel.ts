import {
  readStitchstackPixel,
  type StitchstackPixelConfig,
} from "@/lib/stitchstack-pixel-parse";

export type { StitchstackPixelConfig, StitchstackPixelPayload } from "@/lib/stitchstack-pixel-parse";
export {
  isAllowedStitchstackScriptSrc,
  parseStitchstackPixelPayload,
  readStitchstackPixel,
} from "@/lib/stitchstack-pixel-parse";

/** Upsert live pixel config on the owner's storefront (creates storefront row if needed). */
export async function saveStorefrontStitchstackPixel(
  ownerId: string,
  businessName: string,
  pixel: StitchstackPixelConfig,
): Promise<void> {
  const [{ ensureStorefront }, { prisma }] = await Promise.all([
    import("@/lib/catalogue/storefront"),
    import("@/lib/prisma"),
  ]);
  const storefront = await ensureStorefront(ownerId, businessName);
  await prisma.storefront.update({
    where: { id: storefront.id },
    data: { stitchstackPixel: pixel },
  });
}

export async function loadLiveStitchstackPixel(
  slug: string,
): Promise<StitchstackPixelConfig | null> {
  const { prisma } = await import("@/lib/prisma");
  const storefront = await prisma.storefront.findFirst({
    where: { slug: slug.trim().toLowerCase(), isPublished: true },
    select: { stitchstackPixel: true },
  });
  if (!storefront) return null;
  const pixel = readStitchstackPixel(storefront.stitchstackPixel);
  return pixel?.enabled ? pixel : null;
}
