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
  WebsitePageType,
} from "./types";
import { instructionalCopy } from "./placeholders";
import type { WebsiteCapabilityId } from "./capabilities";

function pickDesignSystem(
  ctx: WebsiteBusinessContext,
  intent?: WebsiteGenerationIntent,
): StudioTemplateId {
  const style = intent?.stylePreference?.toLowerCase() ?? "";
  if (style.includes("premium") || style.includes("handcrafted") || style.includes("artisan")) {
    return "artisan";
  }
  if (style.includes("bold") || style.includes("energetic") || style.includes("market")) {
    return "market";
  }
  if (
    style.includes("warm") ||
    style.includes("local") ||
    style.includes("rustic") ||
    style.includes("farm") ||
    style.includes("country")
  ) {
    return "farmhouse";
  }
  if (style.includes("modern") || style.includes("clean")) {
    return ctx.businessMode === "FOOD_BUSINESS" ? "artisan" : "market";
  }
  if (ctx.existingTemplateId) return ctx.existingTemplateId;
  return defaultTemplateForMode(ctx.businessMode);
}

function sid(prefix: string, i: number): string {
  return `${prefix}-${i}`;
}

function caps(
  ctx: WebsiteBusinessContext,
  intent?: WebsiteGenerationIntent,
): Set<WebsiteCapabilityId> {
  if (intent?.selectedCapabilities?.length) {
    return new Set(intent.selectedCapabilities);
  }
  const inferred = new Set<WebsiteCapabilityId>();
  if (ctx.productCount > 0) inferred.add("SHOP");
  if (ctx.hasMenus) inferred.add("MENUS_PREORDERS");
  if (ctx.hasPickup || ctx.hasFarmStand) inferred.add("PICKUP");
  if (ctx.hasDelivery) inferred.add("DELIVERY");
  inferred.add("NEWSLETTER");
  return inferred;
}

function pages(intent?: WebsiteGenerationIntent): Set<string> {
  return new Set(intent?.selectedPages ?? ["HOME", "ABOUT", "CONTACT", "FAQ", "SHOP"]);
}

function storyBody(
  ctx: WebsiteBusinessContext,
  intent?: WebsiteGenerationIntent,
): { body: string; copyKind: "INSTRUCTIONAL" | "GENERIC" | "SELLER" } {
  const seller = intent?.sellerAbout?.trim() || ctx.about?.trim();
  if (seller) return { body: seller, copyKind: "SELLER" };
  return {
    body: instructionalCopy("what you grow or bake"),
    copyKind: "INSTRUCTIONAL",
  };
}

function homeSections(
  ctx: WebsiteBusinessContext,
  templateId: StudioTemplateId,
  intent?: WebsiteGenerationIntent,
): AiSectionConfig[] {
  const focus = intent?.primaryGoal ?? "";
  const c = caps(ctx, intent);
  const sections: AiSectionConfig[] = [];
  let i = 0;
  const useSamples = Boolean(intent?.includeSampleProducts && ctx.productCount === 0);

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
    copyKind: "GENERIC",
    placeholderKind: intent?.useAiDecorativePlaceholders
      ? "IMAGE_DECORATIVE"
      : undefined,
  });

  if (c.has("PICKUP") && ctx.hasFarmStand) {
    sections.push({
      id: sid("stand", i++),
      type: "FarmStand",
      heading: "Visit the stand",
    });
  }

  if (c.has("MENUS_PREORDERS")) {
    if (ctx.hasMenus) {
      sections.push({
        id: sid("drop", i++),
        type: "NextDrop",
        heading: templateId === "farmhouse" ? "Next collection" : "This week's menu",
        dataSource: "NEXT_DROP",
      });
    } else {
      sections.push({
        id: sid("drop-stub", i++),
        type: "Text",
        heading: "Weekly preorders",
        body: "Set up weekly menus in Vendl — this section stays hidden from visitors until then.",
        visibility: "EDITOR_ONLY",
        placeholderKind: "SETUP_STUB",
        copyKind: "INSTRUCTIONAL",
      });
    }
  }

  if (c.has("SHOP")) {
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
      productPresentation: useSamples ? "SAMPLE" : "LIVE",
      placeholderKind: useSamples ? "SAMPLE_PRODUCTS" : undefined,
      visibility: useSamples ? "EDITOR_ONLY" : "ALL",
    });
  }

  if (c.has("SHOP") && ctx.categoryCount > 0) {
    sections.push({
      id: sid("cats", i++),
      type: "CategoryGrid",
      heading: "Browse categories",
      dataSource: "CATEGORY",
    });
  }

  const story = storyBody(ctx, intent);
  sections.push({
    id: sid("story", i++),
    type: "ImageText",
    heading: "Our story",
    body: story.body,
    copyKind: story.copyKind,
    placeholderKind:
      story.copyKind === "INSTRUCTIONAL"
        ? "COPY_INSTRUCTIONAL"
        : intent?.useAiDecorativePlaceholders
          ? "IMAGE_DECORATIVE"
          : undefined,
    props: intent?.storyImageUrl ? { imageUrl: intent.storyImageUrl } : undefined,
  });

  if (c.has("PICKUP") || c.has("DELIVERY")) {
    sections.push({
      id: sid("pickup", i++),
      type: "Pickup",
      heading: ctx.hasFarmStand ? "Location & pickup" : "Pickup & delivery",
      dataSource: c.has("DELIVERY") ? "DELIVERY_ZONES" : "PICKUP_OPTIONS",
      visibility: ctx.hasPickup || ctx.hasDelivery ? "ALL" : "EDITOR_ONLY",
      placeholderKind:
        ctx.hasPickup || ctx.hasDelivery ? undefined : "SETUP_STUB",
    });
  }

  if (pages(intent).has("REVIEWS") && ctx.reviewCount > 0) {
    sections.push({
      id: sid("reviews", i++),
      type: "Reviews",
      heading: "What customers say",
      dataSource: "TOP_REVIEWS",
    });
  }

  if (c.has("SUBSCRIPTIONS")) {
    sections.push({
      id: sid("subs", i++),
      type: "Text",
      heading: "Subscriptions",
      body: "Set up subscriptions in Vendl to offer boxes and recurring orders.",
      visibility: "EDITOR_ONLY",
      placeholderKind: "SETUP_STUB",
      copyKind: "INSTRUCTIONAL",
    });
  }

  if (c.has("NEWSLETTER")) {
    sections.push({
      id: sid("signup", i++),
      type: "Signup",
      heading: ctx.hasFarmStand ? "Join the farm list" : "Stay in the loop",
      body: "Get updates when new products and menus are available.",
      ctaLabel: "Subscribe",
      dataSource: "SIGNUP_DESTINATION",
      copyKind: "GENERIC",
    });
  }

  while (sections.length > 10) sections.splice(sections.length - 2, 1);
  while (sections.length < 5) {
    sections.splice(sections.length - 1, 0, {
      id: sid("text", i++),
      type: "Text",
      heading: ctx.businessName,
      body: ctx.subheadline ?? `Welcome to ${ctx.businessName}.`,
      copyKind: "GENERIC",
      placeholderKind: "COPY_GENERIC",
    });
  }

  return sections;
}

function buildNavigation(
  intent: WebsiteGenerationIntent | undefined,
  ctx: WebsiteBusinessContext,
): AISitePlan["navigation"] {
  const p = pages(intent);
  const nav: AISitePlan["navigation"] = [{ label: "Home", pageType: "HOME" }];
  if (p.has("SHOP")) nav.push({ label: "Shop", pageType: "SHOP" });
  if (p.has("FARM_STAND") && ctx.hasFarmStand) {
    nav.push({ label: "Farm stand", pageType: "FARM_STAND" });
  }
  if (p.has("ABOUT")) nav.push({ label: "About", pageType: "ABOUT" });
  if (p.has("CONTACT")) nav.push({ label: "Contact", pageType: "CONTACT" });
  if (p.has("FAQ")) nav.push({ label: "FAQ", pageType: "FAQ" });
  return nav.slice(0, 7);
}

function extraPages(
  intent: WebsiteGenerationIntent | undefined,
  ctx: WebsiteBusinessContext,
): AISitePlan["pages"] {
  const p = pages(intent);
  const out: AISitePlan["pages"] = [];
  const story = storyBody(ctx, intent);

  if (p.has("ABOUT")) {
    out.push({
      pageType: "ABOUT",
      title: "About",
      slug: "about",
      sections: [
        {
          id: "about-main",
          type: "About",
          heading: `About ${ctx.businessName}`,
          body: story.body,
          copyKind: story.copyKind,
          placeholderKind:
            story.copyKind === "INSTRUCTIONAL" ? "COPY_INSTRUCTIONAL" : undefined,
        },
      ],
    });
  }
  if (p.has("CONTACT")) {
    out.push({
      pageType: "CONTACT",
      title: "Contact",
      slug: "contact",
      sections: [
        {
          id: "contact-main",
          type: "Text",
          heading: "Get in touch",
          body: "Questions? Get in touch.",
          copyKind: "GENERIC",
          placeholderKind: "COPY_GENERIC",
        },
      ],
    });
  }
  if (p.has("FAQ")) {
    out.push({
      pageType: "FAQ",
      title: "FAQ",
      slug: "faq",
      sections: [
        {
          id: "faq-main",
          type: "Text",
          heading: "Common questions",
          body: instructionalCopy("how ordering, pickup and your products work"),
          copyKind: "INSTRUCTIONAL",
          placeholderKind: "COPY_INSTRUCTIONAL",
        },
      ],
    });
  }
  return out;
}

/** Deterministic planner — scaffold-aware composition + Astra fallback. */
export function planSiteHeuristic(input: SiteGenerationInput): SiteGenerationResult {
  const { businessContext: ctx, intent } = input;
  const designSystem = pickDesignSystem(ctx, intent);
  const sections = homeSections(ctx, designSystem, intent);
  const primaryGoal =
    intent?.primaryGoal ??
    (ctx.hasFarmStand ? "farm-stand" : ctx.hasMenus ? "preorders" : "shop");

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
    navigation: buildNavigation(intent, ctx),
    pages: [
      {
        pageType: "HOME" as WebsitePageType,
        title: "Home",
        sections,
        seo: {
          title: `${ctx.businessName}${ctx.regionLabel ? ` · ${ctx.regionLabel}` : ""}`,
          description:
            ctx.subheadline?.slice(0, 160) ??
            `Shop from ${ctx.businessName} — local food online and nearby.`,
        },
      },
      ...extraPages(intent, ctx),
    ],
    changeSummary: `Draft ${designSystem} site focused on ${primaryGoal}${
      intent?.selectedCapabilities?.length
        ? ` · capabilities: ${intent.selectedCapabilities.join(", ")}`
        : ""
    }.`,
  };

  return { ok: true, plan, provider: "heuristic", model: "rules-v1" };
}
