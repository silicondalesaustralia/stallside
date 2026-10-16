import type { SerializedNodes } from "@craftjs/core";
import type { BusinessMode } from "@/lib/business-mode";
import type { SectionInstance } from "@/lib/website/schema/definition";
import { sectionsToCraftNodes } from "@/lib/website/adapter/to-craft";
import { craftPageSaveErrors } from "@/lib/website/adapter/validate-craft-page";
import { LINKABLE_BUTTON_SECTIONS } from "@/lib/studio/button-link";
import { sectionDefinition } from "@/lib/website/sections/registry";
import type { PageContent } from "../ai/schemas";
import type { NormalizedPage } from "../plan/normalize";
import type { DesignChoice } from "./design";
import { buildSection } from "./section-builders";

export type PageCompileInput = {
  page: NormalizedPage;
  content: PageContent | null;
  design: DesignChoice;
  businessMode: BusinessMode;
  /** Image URL per section index (hero/imageText). */
  images: Record<number, string>;
  /** Main call-to-action target for hero/imageText buttons. */
  primaryLink?: string;
  productIds?: string[];
};

export type CompiledPage = {
  nodes: SerializedNodes;
  sectionCount: number;
  errors: string[];
  seo: { title: string; description: string } | null;
};

function sectionId(pageKey: string, index: number): string {
  const base = pageKey.replace(/[^a-zA-Z0-9]+/g, "_").slice(0, 32);
  return `ai_${base}_${index}`;
}

/** Compiles one page to Craft nodes and validates it with the same rules as editor saves. */
export function compilePage(input: PageCompileInput): CompiledPage {
  const { page, content, design } = input;
  const copyByIndex = new Map((content?.sections ?? []).map((s) => [s.index, s]));
  const isPolicy = page.target.kind === "policy";
  const sections: SectionInstance[] = [];
  page.sections.forEach((planned, index) => {
    const craftName = sectionDefinition(planned.type).craftName;
    const built = buildSection({
      id: sectionId(page.target.key, index),
      type: planned.type,
      copy: copyByIndex.get(index) ?? null,
      templateId: design.templateId,
      preset: planned.type === "hero" && page.target.kind !== "home" ? design.contentHero : design.presets[planned.type],
      imageUrl: input.images[index],
      buttonLink: LINKABLE_BUTTON_SECTIONS.has(craftName) ? input.primaryLink : undefined,
      productIds: planned.type === "productGrid" ? input.productIds : undefined,
      meta: isPolicy ? { reviewRequired: true, reviewKind: "policy" } : undefined,
    });
    if (built) sections.push(built);
  });

  const nodes = sectionsToCraftNodes(sections);
  const kind = page.target.kind === "home" ? "home" : "content";
  const errors = sections.length === 0 ? ["No sections had enough confirmed facts to show."] : [];
  errors.push(...craftPageSaveErrors(nodes, kind, input.businessMode));
  const seo = content
    ? { title: content.seoTitle.trim().slice(0, 60), description: content.seoDescription.trim().slice(0, 155) }
    : null;
  return { nodes, sectionCount: sections.length, errors, seo };
}
