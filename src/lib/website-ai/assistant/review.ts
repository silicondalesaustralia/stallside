import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { extractWebsiteStudio, mergeWebsiteStudioIntoRaw } from "@/lib/studio/storage";
import { writeStorefrontDraft } from "@/lib/website/persistence/draft-store";
import { clearReviewMarkers } from "./review-markers";

export type ReviewResult = { ok: true } | { ok: false; error: string };

/** Seller ticked "I've reviewed this" on an AI-drafted policy page. */
export async function markPolicyReviewed(ownerId: string, pageId: string): Promise<ReviewResult> {
  const row = await prisma.storefront.findFirst({
    where: { ownerId },
    select: { draftConfig: true, draftRevision: true },
  });
  if (!row) return { ok: false, error: "Website not found." };
  const studio = extractWebsiteStudio(row.draftConfig);
  const nodes = studio?.pageNodes?.[pageId];
  if (!studio || !nodes) return { ok: false, error: "That page could not be found." };
  const draft = mergeWebsiteStudioIntoRaw(row.draftConfig, studio.templateId, studio.nodes, {
    [pageId]: clearReviewMarkers(nodes),
  });
  const saved = await writeStorefrontDraft({
    ownerId,
    expectedRevision: row.draftRevision,
    draftConfig: draft as Prisma.InputJsonValue,
  });
  return saved.ok ? { ok: true } : { ok: false, error: "Your draft changed just now. Try again." };
}
