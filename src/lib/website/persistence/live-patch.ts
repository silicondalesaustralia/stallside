import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

/**
 * Applies a scoped change to the live config (blog post or redirects publish)
 * while holding the storefront row lock, so it can't interleave with a full
 * site publish or another scoped patch. No-op when the site isn't published.
 */
export async function patchLiveConfig(
  ownerId: string,
  patch: (publishedConfig: Prisma.JsonValue) => Prisma.InputJsonValue,
): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "Storefront" WHERE "ownerId" = ${ownerId} FOR UPDATE`;
    const sf = await tx.storefront.findUnique({
      where: { ownerId },
      select: { isPublished: true, publishedConfig: true },
    });
    if (!sf?.isPublished || sf.publishedConfig === null) return false;
    await tx.storefront.update({
      where: { ownerId },
      data: { publishedConfig: patch(sf.publishedConfig) },
    });
    return true;
  });
}
