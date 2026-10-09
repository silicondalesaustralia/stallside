import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { snapshotForRestore } from "./restore-snapshot";

export async function listStorefrontPublications(ownerId: string, take = 10) {
  const sf = await prisma.storefront.findUnique({
    where: { ownerId },
    select: { id: true, activePublicationId: true },
  });
  if (!sf) return { activePublicationId: null, publications: [] };
  const publications = await prisma.storefrontPublication.findMany({
    where: { storefrontId: sf.id },
    orderBy: { createdAt: "desc" },
    take,
    select: { id: true, createdAt: true, draftRevision: true },
  });
  return { activePublicationId: sf.activePublicationId, publications };
}

/** Copies a past publication into the draft. The live site is untouched. */
export async function restorePublicationAsDraft(
  ownerId: string,
  publicationId: string,
): Promise<{ ok: true } | { ok: false; reason: "missing" | "conflict" }> {
  const sf = await prisma.storefront.findUnique({
    where: { ownerId },
    select: { id: true, draftRevision: true, draftConfig: true },
  });
  if (!sf) return { ok: false, reason: "missing" };
  const publication = await prisma.storefrontPublication.findFirst({
    where: { id: publicationId, storefrontId: sf.id },
    select: { snapshot: true },
  });
  if (!publication) return { ok: false, reason: "missing" };

  const result = await prisma.storefront.updateMany({
    where: { ownerId, draftRevision: sf.draftRevision },
    data: {
      draftConfig: snapshotForRestore(
        publication.snapshot,
        sf.draftConfig,
      ) as Prisma.InputJsonValue,
      draftRevision: { increment: 1 },
    },
  });
  return result.count === 0 ? { ok: false, reason: "conflict" } : { ok: true };
}
