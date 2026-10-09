import { extractWebsiteStudio } from "@/lib/studio/storage";
import { STUDIO_HOME_PAGE_KEY } from "@/lib/studio/custom-pages";
import { hasInstructionalCopy, isPublicStudioNode } from "@/lib/studio/node-visibility";

/** Seller-facing reasons the draft can't go live. Empty means OK to publish. */
export function findPublishBlockers(draftRaw: unknown): string[] {
  const studio = extractWebsiteStudio(draftRaw);
  if (!studio) return [];
  const pages = {
    ...(studio.pageNodes ?? {}),
    ...(studio.nodes ? { [STUDIO_HOME_PAGE_KEY]: studio.nodes } : {}),
  };
  const blockers: string[] = [];
  for (const [pageKey, nodes] of Object.entries(pages)) {
    const flagged = Object.values(nodes).some(
      (node) => isPublicStudioNode(node) && hasInstructionalCopy(node),
    );
    if (flagged) {
      const page = pageKey === STUDIO_HOME_PAGE_KEY ? "your homepage" : "one of your other pages";
      blockers.push(`Replace the "Tell customers…" example text on ${page}.`);
    }
  }
  return [...new Set(blockers)];
}
