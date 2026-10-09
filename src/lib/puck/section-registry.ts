import type { BusinessMode } from "@/lib/business-mode";
import type { PuckSpikeComponents } from "./spike-config";

export type SectionType = keyof PuckSpikeComponents;

export type SectionRule = {
  type: SectionType;
  label: string;
  description: string;
  category: "recommended" | "sell" | "content" | "business";
  singleton?: boolean;
  required?: boolean;
  businessModes?: BusinessMode[];
};

export const SECTION_RULES: SectionRule[] = [
  {
    type: "Hero",
    label: "Hero",
    description: "Welcome visitors with a headline and image",
    category: "content",
    singleton: true,
  },
  {
    type: "FeaturedProducts",
    label: "Products",
    description: "Show products from your shop",
    category: "sell",
  },
  {
    type: "UpcomingMenus",
    label: "Next drop",
    description: "Promote upcoming menus and pre-orders",
    category: "sell",
    singleton: true,
    businessModes: ["FOOD_BUSINESS", "BOTH"],
  },
  {
    type: "Text",
    label: "Text & image",
    description: "Heading with supporting text",
    category: "content",
  },
  {
    type: "About",
    label: "About us",
    description: "Tell your story",
    category: "business",
    singleton: true,
  },
];

export function sectionRule(type: string): SectionRule | undefined {
  return SECTION_RULES.find((r) => r.type === type);
}

export function sectionLabel(type: string): string {
  return sectionRule(type)?.label ?? type;
}

export function countSectionType(
  content: Array<{ type: string }>,
  type: string,
): number {
  return content.filter((item) => item.type === type).length;
}

export function canInsertSection(
  content: Array<{ type: string }>,
  type: SectionType,
  businessMode: BusinessMode,
): boolean {
  const rule = sectionRule(type);
  if (!rule) return false;
  if (rule.businessModes && !rule.businessModes.includes(businessMode)) {
    return false;
  }
  if (rule.singleton && countSectionType(content, type) > 0) return false;
  return true;
}

export function availableSections(
  content: Array<{ type: string }>,
  businessMode: BusinessMode,
): SectionRule[] {
  return SECTION_RULES.filter((rule) =>
    canInsertSection(content, rule.type, businessMode),
  );
}

export function recommendedSections(
  content: Array<{ type: string }>,
  businessMode: BusinessMode,
): SectionRule[] {
  const picks: SectionType[] =
    businessMode === "FARM_STAND"
      ? ["FeaturedProducts", "About", "Hero", "Text"]
      : businessMode === "BOTH"
        ? ["UpcomingMenus", "FeaturedProducts", "About", "Hero"]
        : ["UpcomingMenus", "FeaturedProducts", "About", "Hero"];

  return picks
    .map((type) => sectionRule(type))
    .filter((rule): rule is SectionRule => Boolean(rule))
    .filter((rule) => canInsertSection(content, rule.type, businessMode));
}

export function sectionsByCategory(
  rules: SectionRule[],
): Record<SectionRule["category"], SectionRule[]> {
  return rules.reduce(
    (acc, rule) => {
      acc[rule.category].push(rule);
      return acc;
    },
    {
      recommended: [] as SectionRule[],
      sell: [] as SectionRule[],
      content: [] as SectionRule[],
      business: [] as SectionRule[],
    },
  );
}
