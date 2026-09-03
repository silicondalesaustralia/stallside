import type { BusinessMode } from "@/lib/business-mode";
import type { CommercePageKind } from "./commerce-pages";
import type { StudioSectionRule, StudioSectionType } from "./types";

export const STUDIO_SECTION_RULES: StudioSectionRule[] = [
  {
    type: "CraftHeroSection",
    label: "Hero",
    description: "Introduce your business with a headline and photo",
    category: "content",
    paletteOrder: 1,
    singleton: true,
    required: true,
    duplicable: false,
    deletable: false,
    homeOnly: true,
  },
  {
    type: "CraftProductDetailSection",
    label: "Product detail",
    description: "Current product image, price and add to cart",
    category: "sell",
    paletteOrder: 0,
    singleton: true,
    required: true,
    duplicable: false,
    deletable: false,
    commerceKinds: ["product"],
  },
  {
    type: "CraftMenuDetailSection",
    label: "Menu detail",
    description: "Current menu title and order list",
    category: "sell",
    paletteOrder: 0,
    singleton: true,
    required: true,
    duplicable: false,
    deletable: false,
    commerceKinds: ["menu"],
  },
  {
    type: "CraftProductGridSection",
    label: "Products",
    description: "Show products you sell",
    category: "sell",
    paletteOrder: 1,
    duplicable: true,
    deletable: true,
  },
  {
    type: "CraftCategoriesSection",
    label: "Categories",
    description: "Help customers browse",
    category: "sell",
    paletteOrder: 2,
    singleton: true,
    duplicable: false,
    deletable: true,
  },
  {
    type: "CraftNextDropSection",
    label: "Next drop",
    description: "Promote your next order window",
    category: "sell",
    paletteOrder: 3,
    singleton: true,
    businessModes: ["FOOD_BUSINESS", "BOTH"],
    duplicable: false,
    deletable: true,
  },
  {
    type: "CraftTextSection",
    label: "Text",
    description: "Add a heading and text",
    category: "content",
    paletteOrder: 3,
    duplicable: true,
    deletable: true,
  },
  {
    type: "CraftImageSection",
    label: "Image",
    description: "Add a photograph",
    category: "content",
    paletteOrder: 4,
    duplicable: true,
    deletable: true,
  },
  {
    type: "CraftImageTextSection",
    label: "Image + text",
    description: "Tell your story",
    category: "content",
    paletteOrder: 5,
    duplicable: true,
    deletable: true,
  },
  {
    type: "CraftAboutSection",
    label: "About",
    description: "Introduce your business",
    category: "trust",
    paletteOrder: 1,
    singleton: true,
    duplicable: false,
    deletable: true,
  },
  {
    type: "CraftReviewsSection",
    label: "Reviews",
    description: "Build trust with customer quotes",
    category: "trust",
    paletteOrder: 2,
    singleton: true,
    duplicable: false,
    deletable: true,
  },
  {
    type: "CraftPickupSection",
    label: "Pickup & delivery",
    description: "Show how customers get their order",
    category: "trust",
    paletteOrder: 3,
    singleton: true,
    duplicable: false,
    deletable: true,
  },
  {
    type: "CraftSignupSection",
    label: "Subscriber signup",
    description: "Collect emails for menus and restocks",
    category: "grow",
    paletteOrder: 1,
    singleton: true,
    duplicable: false,
    deletable: true,
  },
  {
    type: "CraftFarmStandSection",
    label: "Farm stand",
    description: "Show location, hours and what's available",
    category: "trust",
    paletteOrder: 4,
    singleton: true,
    businessModes: ["FARM_STAND", "BOTH"],
    duplicable: false,
    deletable: true,
  },
];

export const STUDIO_RESOLVER_NAMES = [
  ...STUDIO_SECTION_RULES.map((r) => r.type),
  "CraftPageRoot",
] as const;

const CATEGORY_LABELS: Record<StudioSectionRule["category"], string> = {
  sell: "Sell",
  content: "Content",
  trust: "Trust",
  grow: "Grow",
};

export function studioSectionRule(type: string): StudioSectionRule | undefined {
  return STUDIO_SECTION_RULES.find((r) => r.type === type);
}

export function studioSectionLabel(type: string): string {
  return studioSectionRule(type)?.label ?? type;
}

function resolvedName(
  node: { type?: { resolvedName?: string } | string },
): string | undefined {
  return typeof node.type === "string" ? node.type : node.type?.resolvedName;
}

export function countStudioSection(
  nodes: Record<string, { type?: { resolvedName?: string } | string }>,
  type: StudioSectionType,
): number {
  return Object.values(nodes).filter((n) => resolvedName(n) === type).length;
}

export function canInsertStudioSection(
  nodes: Record<string, { type?: { resolvedName?: string } | string }>,
  type: StudioSectionType,
  businessMode: BusinessMode,
  pageKind?: CommercePageKind | null,
): boolean {
  const rule = studioSectionRule(type);
  if (!rule) return false;
  if (rule.businessModes && !rule.businessModes.includes(businessMode)) return false;
  if (rule.homeOnly && pageKind) return false;
  if (rule.commerceKinds) {
    if (!pageKind || !rule.commerceKinds.includes(pageKind)) return false;
  }
  if (rule.singleton && countStudioSection(nodes, type) > 0) return false;
  return true;
}

export function paletteSectionsForMode(
  nodes: Record<string, { type?: { resolvedName?: string } | string }>,
  businessMode: BusinessMode,
  pageKind?: CommercePageKind | null,
): Record<StudioSectionRule["category"], StudioSectionRule[]> {
  const available = STUDIO_SECTION_RULES.filter((rule) =>
    canInsertStudioSection(nodes, rule.type, businessMode, pageKind),
  );
  const grouped: Record<StudioSectionRule["category"], StudioSectionRule[]> = {
    sell: [],
    content: [],
    trust: [],
    grow: [],
  };
  for (const rule of available) {
    grouped[rule.category].push(rule);
  }
  for (const key of Object.keys(grouped) as StudioSectionRule["category"][]) {
    grouped[key].sort((a, b) => a.paletteOrder - b.paletteOrder);
  }
  return grouped;
}

export { CATEGORY_LABELS };
