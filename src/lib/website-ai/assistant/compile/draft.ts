import type { SerializedNodes } from "@craftjs/core";
import { parseStorefrontConfig } from "@/lib/storefront/config";
import { ensureCustomPages, mergeCustomPagesIntoRaw, type StudioPageNodesMap } from "@/lib/studio/custom-pages";
import { ensureBlogSettings, mergeBlogSettingsIntoRaw } from "@/lib/studio/blog";
import { extractWebsiteStudio, mergeWebsiteStudioIntoRaw } from "@/lib/studio/storage";
import type { AssistantContext } from "../context/types";
import type { BriefData } from "../brief/schema";
import type { NormalizedPlan } from "../plan/normalize";
import { shopSelected } from "../plan/targets";
import type { DesignChoice } from "./design";
import type { CompiledPage } from "./page";
import { allocatePages } from "./allocate";
import { applyPageSeo } from "./seo";
import { compileCommercePages, replaceableCommercePage } from "./commerce";

export type CandidateInput = {
  baseDraft: unknown;
  ctx: AssistantContext;
  brief: BriefData;
  design: DesignChoice;
  plan: NormalizedPlan;
  /** Compiled layouts by plan target key. */
  compiled: Record<string, CompiledPage>;
  heroImageUrl: string | null;
};

export type Candidate = {
  draft: Record<string, unknown>;
  /** Page IDs whose AI-drafted text must be reviewed before publishing. */
  reviewPageIds: string[];
  /** Policy pages that kept the seller's existing text. */
  keptPolicyPageIds: string[];
};

function hasContent(nodes: SerializedNodes | undefined): boolean {
  return Boolean(nodes && Object.keys(nodes).length > 1);
}

function asRecord(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === "object" && !Array.isArray(raw) ? { ...(raw as Record<string, unknown>) } : {};
}

/**
 * Builds the full replacement draft: layouts, theme, pages and navigation are replaced; blog posts,
 * existing policy text, hand-made commerce layouts, domains and operational settings are left alone.
 */
export function assembleCandidate(input: CandidateInput): Candidate {
  const { ctx, brief, design, plan, compiled } = input;
  const base = asRecord(input.baseDraft);
  const existingStudio = extractWebsiteStudio(base);
  const { pages, allocations } = allocatePages(ensureCustomPages(base), plan.pages);

  let home: SerializedNodes | undefined;
  const pageNodes: StudioPageNodesMap = {};
  const reviewPageIds: string[] = [];
  const keptPolicyPageIds: string[] = [];
  for (const alloc of allocations) {
    const page = plan.pages.find((p) => p.target.key === alloc.key);
    const result = compiled[alloc.key];
    if (!page || !result) continue;
    if (page.target.kind === "policy" && hasContent(existingStudio?.pageNodes?.[alloc.pageId])) {
      keptPolicyPageIds.push(alloc.pageId);
      continue;
    }
    if (alloc.pageId === "home") home = result.nodes;
    else pageNodes[alloc.pageId] = result.nodes;
    if (page.target.kind === "policy") reviewPageIds.push(alloc.pageId);
  }
  const commerce = compileCommercePages(ctx, design, shopSelected(ctx, brief));
  for (const [key, nodes] of Object.entries(commerce.pages)) {
    if (nodes && replaceableCommercePage(existingStudio?.pageNodes?.[key])) pageNodes[key] = nodes;
  }

  let draft = asRecord(mergeCustomPagesIntoRaw(base, pages));
  draft = asRecord(mergeWebsiteStudioIntoRaw(draft, design.templateId, home ?? existingStudio?.nodes, pageNodes));

  const selected = new Set(brief.pages.selected);
  const blog = ensureBlogSettings(draft);
  draft = mergeBlogSettingsIntoRaw(draft, { ...blog, enabled: selected.has("BLOG"), showInNav: selected.has("BLOG") });
  draft = applyPageSeo(draft, plan, allocations, compiled);

  const config = parseStorefrontConfig(base);
  const theme = { ...config.themeOverrides, ...design.theme };
  if (design.theme.paletteId === undefined) delete theme.paletteId;
  const story = brief.business.story.trim();
  delete draft.headerMenu;

  return {
    draft: {
      ...draft,
      pages: {
        ...config.pages,
        home: { enabled: true },
        shop: { enabled: shopSelected(ctx, brief) },
        about: { enabled: selected.has("ABOUT") },
        contact: { enabled: selected.has("CONTACT") },
      },
      themeOverrides: theme,
      identity: {
        ...config.identity,
        ...(brief.branding.logoUrl ? { logoUrl: brief.branding.logoUrl } : {}),
        ...(brief.branding.logoUrl && !config.identity?.faviconUrl ? { faviconUrl: brief.branding.logoUrl } : {}),
        ...(input.heroImageUrl ? { heroImageUrl: input.heroImageUrl } : {}),
        ...(story.length > 40 ? { about: story.slice(0, 2000) } : {}),
        showPhone: brief.business.showPhone,
      },
      initialBlueprintId: design.blueprintId,
    },
    reviewPageIds,
    keptPolicyPageIds,
  };
}
