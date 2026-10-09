import type { SerializedNodes } from "@craftjs/core";
import type { StudioTemplateId } from "@/lib/studio/types";
import { craftPropsForAiSection } from "@/lib/website-ai/section-map";
import type { WebsiteAiSectionType } from "@/lib/website-ai/types";
import { craftPageToSections } from "@/lib/website/adapter/from-craft";
import type { WebsitePage } from "@/lib/website/schema/definition";
import type { Diagnostic } from "@/lib/website/schema/diagnostics";
import { validatePage } from "@/lib/website/schema/validate";
import { sectionDefinition } from "@/lib/website/sections/registry";
import type { PageKind } from "@/lib/website/sections/fields";
import {
  TEMPLATE_PAGE_KEYS,
  type TemplatePackage,
  type TemplatePageId,
  type TemplateSectionType,
  type TemplateSlot,
} from "./package-schema";
import { fillTokens, type TemplateSeller } from "./tokens";

const AI_TYPE: Record<TemplateSectionType, WebsiteAiSectionType> = {
  hero: "Hero",
  productGrid: "ProductGrid",
  categories: "CategoryGrid",
  nextDrop: "NextDrop",
  text: "Text",
  image: "Image",
  imageText: "ImageText",
  about: "About",
  reviews: "Reviews",
  pickup: "Pickup",
  signup: "Signup",
  farmStand: "FarmStand",
};

const PAGE_KIND: Record<TemplatePageId, PageKind> = { home: "home", shop: "shop" };

export type InstantiatedTemplate = {
  templateId: StudioTemplateId;
  /** Studio page key -> Craft layout. */
  pages: Record<string, SerializedNodes>;
  diagnostics: Diagnostic[];
};

function slotApplies(slot: TemplateSlot, seller: TemplateSeller): boolean {
  if (slot.businessModes && !slot.businessModes.includes(seller.businessMode)) return false;
  const modes = sectionDefinition(slot.type).businessModes;
  return !modes || modes.includes(seller.businessMode);
}

function slotProps(slot: TemplateSlot, pkg: TemplatePackage, seller: TemplateSeller) {
  const def = sectionDefinition(slot.type);
  const props = craftPropsForAiSection({ id: slot.slot, type: AI_TYPE[slot.type] }, pkg.skin);
  for (const [key, value] of Object.entries(slot.props ?? {})) {
    props[key] = typeof value === "string" ? fillTokens(value, seller) : value;
  }
  if (slot.variant && def.variantProp) props[def.variantProp] = slot.variant;
  return props;
}

function pageNodes(pageId: TemplatePageId, slots: TemplateSlot[], pkg: TemplatePackage, seller: TemplateSeller) {
  const nodes: SerializedNodes = {};
  const ids: string[] = [];
  for (const slot of slots.filter((s) => slotApplies(s, seller))) {
    const id = `${pageId}-${slot.slot}`;
    const craftName = sectionDefinition(slot.type).craftName;
    ids.push(id);
    nodes[id] = {
      type: { resolvedName: craftName },
      isCanvas: false,
      props: slotProps(slot, pkg, seller),
      displayName: craftName,
      custom: { visibility: "ALL", templateId: pkg.id, templateSlot: slot.slot },
      hidden: false,
      nodes: [],
      linkedNodes: {},
      parent: "ROOT",
    };
  }
  nodes.ROOT = {
    type: { resolvedName: "CraftPageRoot" },
    isCanvas: true,
    props: {},
    displayName: "CraftPageRoot",
    custom: { source: "template", templateId: pkg.id, templateVersion: pkg.version },
    hidden: false,
    nodes: ids,
    linkedNodes: {},
    parent: null,
  };
  return nodes;
}

/** Deterministic: the same package + seller always yields the same layouts. */
export function instantiateTemplate(pkg: TemplatePackage, seller: TemplateSeller): InstantiatedTemplate {
  const pages: Record<string, SerializedNodes> = {};
  const diagnostics: Diagnostic[] = [];
  for (const pageId of Object.keys(TEMPLATE_PAGE_KEYS) as TemplatePageId[]) {
    const slots = pkg.pages[pageId];
    if (!slots) continue;
    const key = TEMPLATE_PAGE_KEYS[pageId];
    const path = `pages.${key}`;
    const nodes = pageNodes(pageId, slots, pkg, seller);
    const converted = craftPageToSections(nodes, path);
    const page: WebsitePage = {
      id: key,
      kind: PAGE_KIND[pageId],
      slug: pageId === "home" ? "" : pageId,
      title: pageId,
      enabled: true,
      layoutSource: "sections",
      sections: converted.sections,
    };
    diagnostics.push(...converted.diagnostics, ...validatePage(page, path, seller.businessMode));
    pages[key] = nodes;
  }
  return { templateId: pkg.skin, pages, diagnostics };
}
