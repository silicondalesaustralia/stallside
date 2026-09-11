import type { BusinessMode } from "@/lib/business-mode";
import { WEBSITE_PAGE_REGISTRY } from "./page-registry";
import { AI_TO_CRAFT_SECTION, HOME_AI_SECTIONS } from "./section-map";
import type { AISitePlan, WebsiteAiSectionType, WebsiteBusinessContext } from "./types";

export type PlanValidationResult =
  | { ok: true; plan: AISitePlan }
  | { ok: false; errors: string[] };

function homeComplexityOk(count: number): boolean {
  return count >= 5 && count <= 10;
}

export function validateAiSitePlan(
  plan: AISitePlan,
  ctx: WebsiteBusinessContext,
): PlanValidationResult {
  const errors: string[] = [];
  const home = plan.pages.find((p) => p.pageType === "HOME");
  if (!home) {
    errors.push("Plan must include a HOME page");
  } else {
    const def = WEBSITE_PAGE_REGISTRY.HOME;
    if (!homeComplexityOk(home.sections.length)) {
      errors.push(
        `HOME must have ${def.minSections}-${def.maxSections} sections (got ${home.sections.length})`,
      );
    }
    const types = home.sections.map((s) => s.type);
    if (!types.includes("Hero")) errors.push("HOME must include a Hero section");
    const heroes = types.filter((t) => t === "Hero").length;
    if (heroes > 1) errors.push("HOME may only have one Hero");
    if (home.sections[0]?.type !== "Hero") {
      errors.push("HOME first section must be Hero");
    }
    if (!types.includes("ProductGrid") && !types.includes("NextDrop")) {
      errors.push("HOME must include a commerce section (ProductGrid or NextDrop)");
    }
    if (!types.includes("ImageText") && !types.includes("About")) {
      errors.push("HOME must include a story section (ImageText or About)");
    }
    if (
      !types.includes("Reviews") &&
      !types.includes("Pickup") &&
      !types.includes("FarmStand")
    ) {
      errors.push("HOME must include a trust or fulfilment section");
    }
    if (!types.includes("Signup")) {
      errors.push("HOME must include a Signup section");
    }

    for (const section of home.sections) {
      if (!HOME_AI_SECTIONS.includes(section.type)) {
        errors.push(`Unsupported HOME section: ${section.type}`);
      }
      if (!(section.type in AI_TO_CRAFT_SECTION)) {
        errors.push(`Unmapped section type: ${section.type}`);
      }
    }

    const liveFarm = home.sections.find(
      (s) => s.type === "FarmStand" && s.visibility !== "EDITOR_ONLY",
    );
    if (liveFarm && !ctx.hasFarmStand) {
      errors.push("FarmStand section requires farm-stand business mode/data");
    }
    const liveDrop = home.sections.find(
      (s) => s.type === "NextDrop" && s.visibility !== "EDITOR_ONLY",
    );
    if (liveDrop && !ctx.hasMenus) {
      errors.push("NextDrop section requires menus");
    }
  }

  for (const page of plan.pages) {
    const def = WEBSITE_PAGE_REGISTRY[page.pageType];
    if (!def) {
      errors.push(`Unknown page type: ${page.pageType}`);
      continue;
    }
    if (!def.aiComposable && page.sections.length > 0 && page.pageType !== "HOME") {
      // System pages may appear in nav only; ignore empty section lists.
    }
    if (def.aiComposable && !def.aiCreatable && page.pageType !== "HOME") {
      // still ok if registry says composable
    }
  }

  if (plan.navigation.length > 12) {
    errors.push("Navigation should have at most 12 primary items");
  }

  validateModeSections(plan, ctx.businessMode, errors);

  if (errors.length) return { ok: false, errors };
  return { ok: true, plan };
}

function validateModeSections(
  plan: AISitePlan,
  mode: BusinessMode,
  errors: string[],
) {
  const home = plan.pages.find((p) => p.pageType === "HOME");
  if (!home) return;
  const types = new Set(home.sections.map((s) => s.type as WebsiteAiSectionType));
  if (types.has("FarmStand") && mode === "FOOD_BUSINESS") {
    const live = home.sections.some(
      (s) => s.type === "FarmStand" && s.visibility !== "EDITOR_ONLY",
    );
    if (live) errors.push("FarmStand is not allowed for FOOD_BUSINESS mode");
  }
  if (types.has("NextDrop") && mode === "FARM_STAND") {
    const live = home.sections.some(
      (s) => s.type === "NextDrop" && s.visibility !== "EDITOR_ONLY",
    );
    if (live) errors.push("NextDrop is not allowed for FARM_STAND-only mode");
  }
}
