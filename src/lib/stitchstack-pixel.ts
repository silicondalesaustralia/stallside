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
  const { readStoredStitchstackPixel } = await import("@/lib/stitchstack-sync");
  const storefront = await ensureStorefront(ownerId, businessName);
  const existing = readStoredStitchstackPixel(storefront.stitchstackPixel);
  // Preserve sync cache timestamps when reinstalling/refreshing the pixel script.
  const merged = {
    ...pixel,
    ...(existing?.lastOrderSyncAt ? { lastOrderSyncAt: existing.lastOrderSyncAt } : {}),
    ...(existing?.lastAnalyticsSyncAt ? { lastAnalyticsSyncAt: existing.lastAnalyticsSyncAt } : {}),
    ...(existing?.analyticsCache ? { analyticsCache: existing.analyticsCache } : {}),
  };
  await prisma.storefront.update({
    where: { id: storefront.id },
    data: { stitchstackPixel: merged },
  });
}

async function pixelFromStorefrontRaw(raw: unknown): Promise<StitchstackPixelConfig | null> {
  const pixel = readStitchstackPixel(raw);
  return pixel?.enabled ? pixel : null;
}

export async function loadLiveStitchstackPixel(
  slug: string,
): Promise<StitchstackPixelConfig | null> {
  const { prisma } = await import("@/lib/prisma");
  const normalized = slug.trim().toLowerCase();
  const bySlug = await prisma.storefront.findFirst({
    where: { slug: normalized },
    select: { stitchstackPixel: true },
  });
  if (bySlug) return pixelFromStorefrontRaw(bySlug.stitchstackPixel);

  // Renamed subdomain: old slug kept in draftConfig.slugAliases.
  const byAlias = await prisma.storefront.findFirst({
    where: { draftConfig: { path: ["slugAliases"], array_contains: [normalized] } },
    select: { stitchstackPixel: true },
  });
  if (byAlias) return pixelFromStorefrontRaw(byAlias.stitchstackPixel);

  // Hostname / path slug can diverge from storefront.slug. Fall back via stand owner.
  const stand = await prisma.stand.findFirst({
    where: { slug: normalized },
    select: { ownerId: true },
  });
  if (!stand) return null;
  return loadLiveStitchstackPixelForOwner(stand.ownerId);
}

/** Farmstand `/s/{stand}` routes: resolve pixel from the stand's owner storefront. */
export async function loadLiveStitchstackPixelForOwner(
  ownerId: string,
): Promise<StitchstackPixelConfig | null> {
  const { prisma } = await import("@/lib/prisma");
  const storefront = await prisma.storefront.findUnique({
    where: { ownerId },
    select: { stitchstackPixel: true },
  });
  if (!storefront) return null;
  return pixelFromStorefrontRaw(storefront.stitchstackPixel);
}

export async function loadLiveStitchstackPixelForStand(
  standSlug: string,
): Promise<StitchstackPixelConfig | null> {
  const { prisma } = await import("@/lib/prisma");
  const stand = await prisma.stand.findFirst({
    where: { slug: standSlug.trim().toLowerCase() },
    select: { ownerId: true },
  });
  if (!stand) return null;
  return loadLiveStitchstackPixelForOwner(stand.ownerId);
}
