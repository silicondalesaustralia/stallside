import {
  entitySeoKey,
  extractStorefrontSeo,
  mergeStorefrontSeoIntoRaw,
  readEntitySeo,
  writeEntitySeo,
} from "@/lib/studio/seo-settings";
import type { NormalizedPlan } from "../plan/normalize";
import type { Allocation } from "./allocate";
import type { CompiledPage } from "./page";

/** Sets AI titles/descriptions while keeping seller social images and robots choices. */
export function applyPageSeo(
  draft: Record<string, unknown>,
  plan: NormalizedPlan,
  allocations: Allocation[],
  compiled: Record<string, CompiledPage>,
): Record<string, unknown> {
  let seo = extractStorefrontSeo(draft);
  for (const alloc of allocations) {
    const page = plan.pages.find((p) => p.target.key === alloc.key);
    const result = compiled[alloc.key];
    if (!page || !result?.seo || page.target.kind === "policy") continue;
    const key = alloc.pageId === "home" ? entitySeoKey("home") : entitySeoKey("page", alloc.pageId);
    const current = readEntitySeo(seo, key) ?? {};
    seo = writeEntitySeo(seo, key, {
      ...current,
      seoTitle: result.seo.title || current.seoTitle,
      seoDescription: result.seo.description || current.seoDescription,
    });
  }
  return mergeStorefrontSeoIntoRaw(draft, seo);
}
