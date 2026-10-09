import type { SerializedNodes } from "@craftjs/core";
import type { BusinessMode } from "@/lib/business-mode";
import { COMMERCE_PAGES } from "@/lib/studio/commerce-pages";
import { ensureCustomPages, STUDIO_HOME_PAGE_KEY } from "@/lib/studio/custom-pages";
import { entitySeoKey, extractStorefrontSeo, readEntitySeo } from "@/lib/studio/seo-settings";
import { extractStudioFromDraft, extractWebsiteStudio } from "@/lib/studio/storage";
import { defaultTemplateForMode } from "@/lib/studio/types";
import { parseStorefrontConfig } from "@/lib/storefront/config";
import type { WebsiteDefinition, WebsitePage } from "@/lib/website/schema/definition";
import { warning, type Diagnostic } from "@/lib/website/schema/diagnostics";
import { WEBSITE_SCHEMA_VERSION } from "@/lib/website/schema/limits";
import { craftPageToSections } from "./from-craft";
import { navigationFromPages } from "./navigation";

type PageSeed = Omit<WebsitePage, "sections" | "layoutSource">;

/**
 * Deterministic conversion of a stored draft/published config into the Vendl
 * definition. Pure and read-only: nothing is written back.
 */
export function storefrontConfigToDefinition(
  raw: unknown,
  businessMode: BusinessMode,
): { definition: WebsiteDefinition; diagnostics: Diagnostic[] } {
  const studio = extractStudioFromDraft(raw);
  const config = parseStorefrontConfig(raw);
  const seo = extractStorefrontSeo(raw);
  const customPages = ensureCustomPages(raw);
  const diagnostics: Diagnostic[] = [];
  if (studio && !extractWebsiteStudio(raw)) {
    diagnostics.push(warning("pages.home", "Homepage comes from the old craftSpike payload (same as the live renderer)."));
  }
  const pages: Record<string, WebsitePage> = {};

  const addPage = (seed: PageSeed, nodes: SerializedNodes | undefined) => {
    const path = `pages.${seed.id}`;
    if (!nodes) {
      pages[seed.id] = { ...seed, layoutSource: "legacy", sections: [] };
      return;
    }
    const converted = craftPageToSections(nodes, path);
    diagnostics.push(...converted.diagnostics);
    pages[seed.id] = { ...seed, layoutSource: "sections", sections: converted.sections };
  };

  const homeSeo = readEntitySeo(seo, "home");
  addPage(
    { id: STUDIO_HOME_PAGE_KEY, kind: "home", slug: "", title: "Home", enabled: true, ...(homeSeo ? { seo: homeSeo } : {}) },
    studio?.nodes,
  );
  for (const page of COMMERCE_PAGES) {
    addPage(
      { id: page.key, kind: page.kind, slug: page.kind, title: page.label, enabled: true },
      studio?.pageNodes?.[page.key],
    );
  }
  for (const page of customPages) {
    const pageSeo = readEntitySeo(seo, entitySeoKey("page", page.id));
    addPage(
      {
        id: page.id,
        kind: "content",
        slug: page.slug,
        title: page.title,
        enabled: page.enabled,
        ...(pageSeo ? { seo: pageSeo } : {}),
      },
      studio?.pageNodes?.[page.id],
    );
  }
  for (const [key, nodes] of Object.entries(studio?.pageNodes ?? {})) {
    if (pages[key]) continue;
    diagnostics.push(warning(`pages.${key}`, `Layout for a page that no longer exists was kept (disabled).`));
    addPage({ id: key, kind: "content", slug: key, title: key, enabled: false }, nodes);
  }

  const overrides = config.themeOverrides ?? {};
  const skin = studio?.templateId ?? defaultTemplateForMode(businessMode);
  return {
    definition: {
      schemaVersion: WEBSITE_SCHEMA_VERSION,
      template: { id: `studio:${skin}`, version: 0 },
      theme: { skin, ...overrides },
      identity: config.identity ?? {},
      navigation: navigationFromPages(customPages),
      pages,
    },
    diagnostics,
  };
}
