import type { BusinessMode } from "@/lib/business-mode";
import type { CraftSectionType } from "./types";

export type CraftSectionRule = {
  type: CraftSectionType;
  label: string;
  description: string;
  singleton?: boolean;
  required?: boolean;
  businessModes?: BusinessMode[];
};

export const CRAFT_SECTION_RULES: CraftSectionRule[] = [
  {
    type: "CraftHeroSection",
    label: "Hero",
    description: "Introduce your business",
    singleton: true,
    required: true,
  },
  {
    type: "CraftProductGridSection",
    label: "Products",
    description: "Show what you sell",
  },
  {
    type: "CraftNextDropSection",
    label: "Next drop",
    description: "Promote upcoming orders",
    singleton: true,
    businessModes: ["FOOD_BUSINESS", "BOTH"],
  },
  {
    type: "CraftAboutSection",
    label: "About us",
    description: "Tell your story",
    singleton: true,
  },
];

export const CRAFT_RESOLVER_NAMES = [
  ...CRAFT_SECTION_RULES.map((r) => r.type),
  "CraftPageRoot",
] as const;

export function craftSectionRule(type: string): CraftSectionRule | undefined {
  return CRAFT_SECTION_RULES.find((r) => r.type === type);
}

export function craftSectionLabel(type: string): string {
  return craftSectionRule(type)?.label ?? type;
}

export function countCraftSection(
  nodes: Record<string, { type?: { resolvedName?: string } | string }>,
  type: CraftSectionType,
): number {
  return Object.values(nodes).filter((n) => {
    const name =
      typeof n.type === "string" ? n.type : n.type?.resolvedName;
    return name === type;
  }).length;
}

export function canInsertCraftSection(
  nodes: Record<string, { type?: { resolvedName?: string } | string }>,
  type: CraftSectionType,
  businessMode: BusinessMode,
): boolean {
  const rule = craftSectionRule(type);
  if (!rule) return false;
  if (rule.businessModes && !rule.businessModes.includes(businessMode)) {
    return false;
  }
  if (rule.singleton && countCraftSection(nodes, type) > 0) return false;
  return true;
}

export function availableCraftSections(
  nodes: Record<string, { type?: { resolvedName?: string } | string }>,
  businessMode: BusinessMode,
): CraftSectionRule[] {
  return CRAFT_SECTION_RULES.filter((rule) =>
    canInsertCraftSection(nodes, rule.type, businessMode),
  );
}
