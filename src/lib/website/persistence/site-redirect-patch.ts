import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { withRenameRedirect, withoutRedirectFrom } from "@/lib/studio/rename-redirects";

/**
 * Applies a config change to both draft and live config, for things that are
 * live immediately (e.g. product categories). Bumps the draft revision so an
 * open editor reloads instead of overwriting it.
 */
export async function patchSiteConfig(ownerId: string, patch: (raw: unknown) => Record<string, unknown>): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "Storefront" WHERE "ownerId" = ${ownerId} FOR UPDATE`;
    const sf = await tx.storefront.findUnique({
      where: { ownerId },
      select: { draftConfig: true, publishedConfig: true },
    });
    if (!sf) return;
    await tx.storefront.update({
      where: { ownerId },
      data: {
        draftConfig: patch(sf.draftConfig) as Prisma.InputJsonValue,
        draftRevision: { increment: 1 },
        ...(sf.publishedConfig !== null
          ? { publishedConfig: patch(sf.publishedConfig) as Prisma.InputJsonValue }
          : {}),
      },
    });
  });
}

export async function addSiteRenameRedirect(ownerId: string, from: string, to: string): Promise<void> {
  if (from === to) return;
  await patchSiteConfig(ownerId, (raw) => withRenameRedirect(raw, from, to));
}

export async function clearSiteRedirectFrom(ownerId: string, path: string): Promise<void> {
  await patchSiteConfig(ownerId, (raw) => withoutRedirectFrom(raw, path));
}
