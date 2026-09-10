import { defaultTemplateForMode } from "@/lib/studio/types";
import type { StudioTemplateId } from "@/lib/studio/types";
import { WEBSITE_AI_SPEC_VERSION } from "./types";
import type {
  AISitePlan,
  AiSectionConfig,
  SiteGenerationInput,
  SiteGenerationResult,
  WebsiteBusinessContext,
  WebsiteGenerationIntent,
} from "./types";

function pickDesignSystem(
  ctx: WebsiteBusinessContext,
  intent?: WebsiteGenerationIntent,
): StudioTemplateId {
  const style = intent?.stylePreference?.toLowerCase() ?? "";
  if (style.includes("artisan") || style.includes("premium")) return "artisan";
  if (style.includes("market") || style.includes("bold") || style.includes("modern")) {
    return "market";
  }
  if (style.includes("rustic") || style.includes("farm") || style.includes("country")) {
    return "farmhouse";
  }
  if (ctx.existingTemplateId) return ctx.existingTemplateId;
  return defaultTemplateForMode(ctx.businessMode);
}

function sid(prefix: string, i: number): string {
  return `${prefix}-${i}`;
}

function factualAbout(
  ctx: WebsiteBusinessContext,
  intent?: WebsiteGenerationIntent,
): string {
  const seller = intent?.sellerAbout?.trim();
  if (seller) return seller;
  if (ctx.about?.trim()) return ctx.about.trim();
  const parts = [`${ctx.businessName} is a local food business`];
  if (ctx.regionLabel) parts.push(`based in ${ctx.regionLabel}`);
  parts.push(".");
  return parts.join(" ").replace(" .", ".");
}

function homeSections(
  ctx: WebsiteBusinessContext,
  templateId: StudioTemplateId,
  intent?: WebsiteGenerationIntent,
): AiSectionConfig[] {
  const focus = intent?.primaryGoal ?? "";
  const sections: AiSectionConfig[] = [];
  let i = 0;

  sections.push({
    id: sid("hero", i++),
    type: "Hero",
    headline: ctx.headline,
    subheadline: ctx.subheadline ?? undefined,
    ctaLabel:
      focus === "farm-stand"
        ? "Visit the stand"
        : focus === "preorders"
          ? "Order this week"
          : "Browse",
  });

  const preferStand = focus === "farm-stand" || (!focus && ctx.hasFarmStand);
  const preferMenu = focus === "preorders" || (!focus && ctx.hasMenus && !preferStand);

  if (preferStand && ctx.hasFarmStand) {
    sections.push({
      id: sid("stand", i++),
      type: "FarmStand",
      heading: "Visit the stand",
    });
  }
  if (preferMenu && ctx.hasMenus) {
    sections.push({
      id: sid("drop", i++),
      type: "NextDrop",
      heading: templateId === "farmhouse" ? "Next collection" : "This week's menu",
    });
  }

  sections.push({
    id: sid("products", i++),
    type: "ProductGrid",
    heading:
      templateId === "farmhouse"
        ? "Fresh from the farm"
        : templateId === "market"
          ? "Shop all"
          : "Fresh from the oven",
    dataSource: "FEATURED_PRODUCTS",
  });

  if (ctx.categoryCount > 0) {
    sections.push({
      id: sid("cats", i++),
      type: "CategoryGrid",
      heading: "Browse categories",
      dataSource: "CATEGORY",
    });
  }

  if (!preferStand && ctx.hasFarmStand) {
    sections.push({
      id: sid("stand", i++),
      type: "FarmStand",
      heading: "Visit the stand",
    });
  }
  if (!preferMenu && ctx.hasMenus) {
    sections.push({
      id: sid("drop", i++),
      type: "NextDrop",
      heading: "Next drop",
    });
  }

  const aboutBody = factualAbout(ctx, intent);

  sections.push({
    id: sid("story", i++),
    type: "ImageText",
    heading: focus === "story" || aboutBody ? "Our story" : "About us",
    body: aboutBody,
    props: intent?.storyImageUrl
      ? { imageUrl: intent.storyImageUrl }
      : undefined,
  });

  sections.push({
    id: sid("pickup", i++),
    type: "Pickup",
    heading: ctx.hasFarmStand ? "Location & pickup" : "Pickup & delivery",
  });

  if (ctx.reviewCount > 0) {
    sections.push({
      id: sid("reviews", i++),
      type: "Reviews",
      heading: "What customers say",
      dataSource: "TOP_REVIEWS",
    });
  }

  sections.push({
    id: sid("signup", i++),
    type: "Signup",
    heading: ctx.hasFarmStand ? "Join the farm list" : "Stay in the loop",
    body: "Get updates when new products and menus are available.",
    ctaLabel: "Subscribe",
  });

  // Complexity budget 5–10
  while (sections.length > 10) sections.splice(sections.length - 2, 1);
  while (sections.length < 5) {
    sections.splice(sections.length - 1, 0, {
      id: sid("text", i++),
      type: "Text",
      heading: ctx.businessName,
      body: ctx.subheadline ?? factualAbout(ctx, intent),
    });
  }

  return sections;
}

/** Deterministic planner — used for A/B without OpenAI, and as OpenAI fallback. */
export function planSiteHeuristic(input: SiteGenerationInput): SiteGenerationResult {
  const { businessContext: ctx, intent } = input;
  const designSystem = pickDesignSystem(ctx, intent);
  const sections = homeSections(ctx, designSystem, intent);

  const missing: AISitePlan["missingInformation"] = [];
  if (!intent?.sellerAbout && !ctx.about) {
    missing.push({
      code: "BUSINESS_STORY",
      message: "Add a short business story to strengthen your About section.",
      blocking: false,
    });
  }
  if (!ctx.heroImageUrl) {
    missing.push({
      code: "PHOTOGRAPHY",
      message: "A farm or business photo would make the site more personal.",
      blocking: false,
    });
  }
  if (!intent?.storyImageUrl) {
    missing.push({
      code: "STORY_IMAGE",
      message: "An About photo helps the story section feel real.",
      blocking: false,
    });
  }

  const primaryGoal =
    intent?.primaryGoal ??
    (ctx.hasFarmStand ? "farm-stand" : ctx.hasMenus ? "preorders" : "shop");

  const navigation: AISitePlan["navigation"] = [
    { label: "Home", pageType: "HOME" },
    { label: "Shop", pageType: "SHOP" },
  ];
  if (ctx.hasFarmStand) {
    navigation.push({ label: "Farm stand", pageType: "FARM_STAND" });
  }
  navigation.push({ label: "About", pageType: "ABOUT" });
  navigation.push({ label: "Contact", pageType: "CONTACT" });

  const plan: AISitePlan = {
    version: WEBSITE_AI_SPEC_VERSION,
    designSystem,
    siteStrategy: {
      primaryGoal,
      audienceSummary: ctx.regionLabel
        ? `Local customers near ${ctx.regionLabel}`
        : "Local customers looking for fresh food",
      contentPriorities: sections.map((s) => s.type).slice(0, 6),
    },
    navigation: navigation.slice(0, 7),
    pages: [
      {
        pageType: "HOME",
        title: "Home",
        sections,
        seo: {
          title: `${ctx.businessName}${ctx.regionLabel ? ` · ${ctx.regionLabel}` : ""}`,
          description:
            ctx.subheadline?.slice(0, 160) ??
            `Shop from ${ctx.businessName} — local food online and nearby.`,
        },
      },
    ],
    missingInformation: missing,
    changeSummary: `Draft ${designSystem} homepage focused on ${primaryGoal}.`,
  };

  return { ok: true, plan, provider: "heuristic", model: "rules-v1" };
}
