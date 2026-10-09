import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { parseStorefrontIdentity, identityColumnData } from "@/lib/storefront/identity";
import { findPublishBlockers } from "./publish-checks";

export class PublishBlockedError extends Error {
  constructor(readonly blockers: string[]) {
    super(`Can't publish yet: ${blockers.join(" ")}`);
    this.name = "PublishBlockedError";
  }
}

function identityFromConfig(raw: unknown) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  return parseStorefrontIdentity((raw as { identity?: unknown }).identity);
}

/**
 * Snapshots the current draft as an immutable publication and makes it live.
 * Identity columns are mirrored so non-website readers see live values.
 */
export async function publishStorefront(ownerId: string, userId?: string) {
  const sf = await prisma.storefront.findUniqueOrThrow({ where: { ownerId } });
  const blockers = findPublishBlockers(sf.draftConfig);
  if (blockers.length > 0) throw new PublishBlockedError(blockers);

  const snapshot = sf.draftConfig as Prisma.InputJsonValue;
  await prisma.$transaction(async (tx) => {
    const publication = await tx.storefrontPublication.create({
      data: {
        storefrontId: sf.id,
        draftRevision: sf.draftRevision,
        snapshot,
        createdByUserId: userId ?? null,
      },
      select: { id: true },
    });
    await tx.storefront.update({
      where: { ownerId },
      data: {
        ...identityColumnData(identityFromConfig(sf.draftConfig)),
        isPublished: true,
        publishedConfig: snapshot,
        publishedAt: new Date(),
        activePublicationId: publication.id,
      },
    });
  });
}

/** Like publishStorefront, but returns blockers instead of throwing them. */
export async function tryPublishStorefront(
  ownerId: string,
  userId?: string,
): Promise<{ ok: true } | { ok: false; blockers: string[] }> {
  try {
    await publishStorefront(ownerId, userId);
    return { ok: true };
  } catch (err) {
    if (err instanceof PublishBlockedError) return { ok: false, blockers: err.blockers };
    throw err;
  }
}

export async function unpublishStorefront(ownerId: string) {
  await prisma.storefront.update({
    where: { ownerId },
    data: { isPublished: false },
  });
}

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
    select: { id: true, draftRevision: true },
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
      draftConfig: publication.snapshot as Prisma.InputJsonValue,
      draftRevision: { increment: 1 },
    },
  });
  return result.count === 0 ? { ok: false, reason: "conflict" } : { ok: true };
}
