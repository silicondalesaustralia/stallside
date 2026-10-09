import type { BusinessMode } from "@/lib/business-mode";
import { validateSection } from "@/lib/website/sections/validate-section";
import { isVendlSectionType, sectionDefinition } from "@/lib/website/sections/registry";
import type { PageKind } from "@/lib/website/sections/fields";
import { websiteDefinitionSchema, type WebsiteDefinition, type WebsitePage } from "./definition";
import { error, hasErrors, type Diagnostic } from "./diagnostics";
import { WEBSITE_LIMITS, WEBSITE_SCHEMA_VERSION } from "./limits";

const REQUIRED_BY_KIND: Partial<Record<PageKind, string>> = {
  product: "productDetail",
  menu: "menuDetail",
};

export function validatePage(
  page: WebsitePage,
  path: string,
  businessMode?: BusinessMode,
): Diagnostic[] {
  const kind = page.kind as PageKind;
  const out: Diagnostic[] = [];
  const seenIds = new Set<string>();
  const counts = new Map<string, number>();
  page.sections.forEach((section, i) => {
    const sectionPath = `${path}.sections.${i}`;
    if (seenIds.has(section.id)) out.push(error(sectionPath, `Duplicate section id "${section.id}".`));
    seenIds.add(section.id);
    counts.set(section.type, (counts.get(section.type) ?? 0) + 1);
    out.push(...validateSection(section, kind, sectionPath, businessMode));
  });
  for (const [type, n] of counts) {
    if (n > 1 && isVendlSectionType(type) && sectionDefinition(type).singleton) {
      out.push(error(path, `${sectionDefinition(type).label} can only appear once per page.`));
    }
  }
  const required = REQUIRED_BY_KIND[kind];
  if (required && page.sections.length > 0) {
    const live = page.sections.some((s) => s.type === required && s.visibility === "public");
    if (!live) {
      out.push(error(path, `This page needs a visible ${required === "productDetail" ? "product detail" : "menu"} section so customers can buy.`));
    }
  }
  return out;
}

/** Full structural + registry validation. Future schema versions fail safely. */
export function validateWebsiteDefinition(
  raw: unknown,
  businessMode?: BusinessMode,
): { definition?: WebsiteDefinition; diagnostics: Diagnostic[] } {
  const version = (raw as { schemaVersion?: unknown } | null)?.schemaVersion;
  if (typeof version === "number" && version > WEBSITE_SCHEMA_VERSION) {
    return {
      diagnostics: [
        error("schemaVersion", `Website saved by a newer Vendl version (v${version}). Not reinterpreting it.`),
      ],
    };
  }
  if (JSON.stringify(raw ?? null).length > WEBSITE_LIMITS.definitionBytes) {
    return { diagnostics: [error("", "Website is too large to save. Remove some sections or pages.")] };
  }
  const parsed = websiteDefinitionSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      diagnostics: parsed.error.issues.map((i) => error(i.path.map(String).join("."), i.message)),
    };
  }
  const definition = parsed.data;
  const diagnostics: Diagnostic[] = [];
  const slugs = new Map<string, string>();
  for (const [key, page] of Object.entries(definition.pages)) {
    const path = `pages.${key}`;
    if (page.id !== key) diagnostics.push(error(path, `Page key "${key}" doesn't match id "${page.id}".`));
    const slugKey = `${page.kind}:${page.slug}`;
    if (page.kind === "content" && slugs.has(slugKey)) {
      diagnostics.push(error(`${path}.slug`, `Two pages use the address /${page.slug}.`));
    }
    slugs.set(slugKey, key);
    diagnostics.push(...validatePage(page, path, businessMode));
  }
  if (Object.keys(definition.pages).length > WEBSITE_LIMITS.pages) {
    diagnostics.push(error("pages", `A website can have at most ${WEBSITE_LIMITS.pages} pages.`));
  }
  return hasErrors(diagnostics) ? { diagnostics } : { definition, diagnostics };
}
