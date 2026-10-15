import type { WebsiteGenerationIntent } from "@/lib/website-ai/types";
import type { AssistantContext } from "../context/types";
import { defaultSelectedPages, isAssistantPageId } from "../pages/catalogue";
import { emptyBrief, type BriefData, type PolicyPageId, type PrimaryGoal } from "./schema";

const V1_GOALS: Record<string, PrimaryGoal> = {
  "farm-stand": "local_visits",
  preorders: "pre_orders",
  menu: "pre_orders",
  shop: "sell_online",
};

const V1_PAGES: Record<string, string> = { FARM_STAND: "VISIT" };
const V1_POLICIES: Record<string, PolicyPageId> = {
  PRIVACY: "PRIVACY",
  TERMS: "TERMS",
  REFUNDS: "REFUNDS",
  DELIVERY_POLICY: "SHIPPING",
};

function guessGoal(ctx: AssistantContext): PrimaryGoal {
  if (ctx.features.preOrders.length > 0 || ctx.features.menus.length > 0) return "pre_orders";
  if (ctx.catalogue.productCount > 0) return "sell_online";
  if (ctx.businessMode === "FARM_STAND") return "local_visits";
  return "information";
}

function clip(value: string | null | undefined, max: number): string {
  return (value ?? "").trim().slice(0, max);
}

function hexOrNull(value: string | null): string | null {
  return value && /^#[0-9a-fA-F]{6}$/.test(value) ? value : null;
}

/** Brief prefilled from existing Vendl data and old AI-builder answers. Reads only. */
export function prefillBrief(ctx: AssistantContext, v1?: WebsiteGenerationIntent | null): BriefData {
  const brief = emptyBrief();
  const about = clip(ctx.existing.about, 2000);
  brief.business.name = clip(ctx.businessName, 120);
  brief.business.description = clip(ctx.existing.subheadline || ctx.existing.headline, 600);
  brief.business.story = about;
  brief.business.serviceArea = clip(ctx.existing.regionLabel, 200);
  if (ctx.catalogue.categories.length > 0) {
    brief.business.offering = clip(ctx.catalogue.categories.map((c) => c.title).join(", "), 600);
  }
  brief.business.primaryGoal = guessGoal(ctx);

  brief.branding.logoUrl = ctx.existing.logoUrl;
  brief.branding.accentColor = hexOrNull(ctx.existing.accentColor);
  brief.branding.secondaryColor = hexOrNull(ctx.existing.secondaryColor);
  brief.branding.heroImageUrl = ctx.existing.heroImageUrl;
  brief.branding.useExisting = Boolean(ctx.existing.logoUrl || ctx.existing.accentColor);

  brief.pages.selected = defaultSelectedPages(ctx, brief);

  if (v1) {
    const goal = v1.primaryGoal ? V1_GOALS[v1.primaryGoal] : undefined;
    if (goal) brief.business.primaryGoal = goal;
    if (v1.sellerAbout && v1.sellerAbout.length > about.length) brief.business.story = clip(v1.sellerAbout, 2000);
    if (v1.sellerNotes) brief.business.instructions = clip(v1.sellerNotes, 1000);
    const area = v1.contextAnswers?.find((a) => a.questionId === "AREA")?.answer;
    if (area && !brief.business.serviceArea) brief.business.serviceArea = clip(area, 200);
    brief.branding.decorativeImages = Boolean(v1.useAiDecorativePlaceholders);
    const pages = (v1.selectedPages ?? []).map((p) => V1_PAGES[p] ?? p).filter(isAssistantPageId);
    if (pages.length > 0) brief.pages.selected = ["HOME", ...pages.filter((p) => p !== "HOME")];
    brief.pages.policies = (v1.selectedPages ?? [])
      .map((p) => V1_POLICIES[p])
      .filter((p): p is PolicyPageId => Boolean(p));
  }

  brief.prefilledAt = new Date().toISOString();
  return brief;
}
