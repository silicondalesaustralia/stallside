import type { SerializedNodes } from "@craftjs/core";
import type { StorefrontCustomPage } from "@/lib/studio/custom-pages";

function needsReview(nodes: SerializedNodes): boolean {
  return Object.values(nodes).some((node) => {
    const custom = node.custom as Record<string, unknown> | undefined;
    return custom?.reviewRequired === true;
  });
}

/** Page IDs with AI-drafted text that the seller has not reviewed yet. */
export function pagesNeedingReview(pageNodes: Record<string, SerializedNodes>): string[] {
  return Object.entries(pageNodes)
    .filter(([, nodes]) => needsReview(nodes))
    .map(([pageId]) => pageId);
}

/** Publish blockers for enabled pages that still carry an AI review marker. */
export function reviewRequiredBlockers(
  pageNodes: Record<string, SerializedNodes>,
  pages: StorefrontCustomPage[],
): string[] {
  return pagesNeedingReview(pageNodes).flatMap((pageId) => {
    const page = pages.find((p) => p.id === pageId);
    if (!page?.enabled) return [];
    return [`Review the AI-drafted "${page.title}" page and tick "I've reviewed this" before publishing.`];
  });
}

/** Removes review markers from one page's nodes. */
export function clearReviewMarkers(nodes: SerializedNodes): SerializedNodes {
  const out: SerializedNodes = {};
  for (const [id, node] of Object.entries(nodes)) {
    const custom = { ...(node.custom as Record<string, unknown> | undefined) };
    if (custom.reviewRequired === true) {
      delete custom.reviewRequired;
      custom.reviewedAt = new Date().toISOString();
    }
    out[id] = { ...node, custom };
  }
  return out;
}
