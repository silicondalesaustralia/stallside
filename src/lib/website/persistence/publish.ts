import { prisma } from "@/lib/prisma";
import { parseStorefrontIdentity, identityColumnData } from "@/lib/storefront/identity";
import { DraftConflictError } from "./draft-store";
import { findPublishBlockers } from "./publish-checks";
import { withoutDraftOnlyKeys } from "@/lib/website/templates/restore-point";

export class PublishBlockedError extends Error {
  constructor(readonly blockers: string[]) {
    super(`Can't publish yet: ${blockers.join(" ")}`);
    this.name = "PublishBlockedError";
  }
}

export type PublishResult =
  | { ok: true; publicationId: string; publishedAt: Date }
  | { ok: false; reason: "blocked"; blockers: string[] }
  | { ok: false; reason: "conflict" };

function identityFromConfig(raw: unknown) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  return parseStorefrontIdentity((raw as { identity?: unknown }).identity);
}

/**
 * Snapshots the current draft as an immutable publication and makes it live.
 * Publishes exactly the revision that was read: if the draft changes while
 * publishing, nothing is published and DraftConflictError is thrown.
 */
export async function publishStorefront(ownerId: string, userId?: string) {
  const sf = await prisma.storefront.findUniqueOrThrow({ where: { ownerId } });
  const blockers = findPublishBlockers(sf.draftConfig);
  if (blockers.length > 0) throw new PublishBlockedError(blockers);

  const snapshot = withoutDraftOnlyKeys(sf.draftConfig);
  const publishedAt = new Date();
  const publicationId = await prisma.$transaction(async (tx) => {
    const publication = await tx.storefrontPublication.create({
      data: {
        storefrontId: sf.id,
        draftRevision: sf.draftRevision,
        snapshot,
        createdByUserId: userId ?? null,
      },
      select: { id: true },
    });
    const updated = await tx.storefront.updateMany({
      where: { ownerId, draftRevision: sf.draftRevision },
      data: {
        ...identityColumnData(identityFromConfig(sf.draftConfig)),
        isPublished: true,
        publishedConfig: snapshot,
        publishedAt,
        activePublicationId: publication.id,
      },
    });
    if (updated.count === 0) throw new DraftConflictError();
    return publication.id;
  });
  return { publicationId, publishedAt };
}

/** Like publishStorefront, but returns blockers/conflicts instead of throwing. */
export async function tryPublishStorefront(
  ownerId: string,
  userId?: string,
): Promise<PublishResult> {
  try {
    const published = await publishStorefront(ownerId, userId);
    return { ok: true, ...published };
  } catch (err) {
    if (err instanceof PublishBlockedError) {
      return { ok: false, reason: "blocked", blockers: err.blockers };
    }
    if (err instanceof DraftConflictError) return { ok: false, reason: "conflict" };
    throw err;
  }
}

/** Query-string error code for redirect-style publish actions. */
export function publishErrorCode(result: Exclude<PublishResult, { ok: true }>) {
  return result.reason === "conflict" ? "conflict" : "publish_blocked";
}

export async function unpublishStorefront(ownerId: string) {
  await prisma.storefront.update({
    where: { ownerId },
    data: { isPublished: false },
  });
}
