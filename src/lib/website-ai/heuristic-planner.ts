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
import {
  heroPresetForRecipe,
  pickLayoutRecipe,
  slotsForRecipe,
  type HomeSlot,
  type LayoutRecipeId,
} from "./layout-recipes";
import { heroPresetFromBlueprintHero } from "./blueprint-hero-preset";
import {
  getWebsiteBlueprint,
  recommendWebsiteBlueprint,
  resolveWebsiteBlueprint,
} from "@/lib/website/blueprints";

function pickDesignSystem(
  ctx: WebsiteBusinessContext,
  intent?: WebsiteGenerationIntent,
): StudioTemplateId {
  const blueprint = resolveWebsiteBlueprint(intent?.blueprintId);
  if (blueprint) return blueprint.designSystem;

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

function resolveRecipe(
  ctx: WebsiteBusinessContext,
  intent?: WebsiteGenerationIntent,
): LayoutRecipeId {
  const blueprint = resolveWebsiteBlueprint(intent?.blueprintId);
  if (blueprint) return blueprint.layoutRecipe;
  return pickLayoutRecipe(ctx, intent);
}

function resolveHomeSlots(
  ctx: WebsiteBusinessContext,
  intent?: WebsiteGenerationIntent,
  recipe?: LayoutRecipeId,
): HomeSlot[] {
  const blueprint = resolveWebsiteBlueprint(intent?.blueprintId);
  if (blueprint?.preferredHomeSlots?.length) return blueprint.preferredHomeSlots;
  return slotsForRecipe(recipe ?? pickLayoutRecipe(ctx, intent));
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

function buildSlot(
  slot: HomeSlot,
  ctx: WebsiteBusinessContext,
  templateId: StudioTemplateId,
  intent: WebsiteGenerationIntent | undefined,
  c: Set<WebsiteCapabilityId>,
  recipe: LayoutRecipeId,
  i: { n: number },
): AiSectionConfig | null {
  const useSamples = Boolean(intent?.includeSampleProducts && ctx.productCount === 0);
  const nextId = (prefix: string) => sid(prefix, i.n++);

  if (slot === "commerce") {
    const preferDrop =
      recipe === "weekly_drop" ||
      (c.has("MENUS_PREORDERS") &&
        ctx.hasMenus &&
        recipe !== "shop_first" &&
        recipe !== "browse_catalog");
    if (preferDrop && ctx.hasMenus && ctx.businessMode !== "FARM_STAND") {
      return {
        id: nextId("drop"),
        type: "NextDrop",
        heading: templateId === "farmhouse" ? "Next collection" : "This week's menu",
        dataSource: "NEXT_DROP",
      };
    }
    return {
      id: nextId("products"),
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
    };
  }

  if (slot === "categories") {
    return {
      id: nextId("cats"),
      type: "CategoryGrid",
      heading: "Browse categories",
      dataSource: "CATEGORY",
      visibility: ctx.categoryCount > 0 ? "ALL" : "EDITOR_ONLY",
      placeholderKind: ctx.categoryCount > 0 ? undefined : "SETUP_STUB",
    };
  }

  if (slot === "story") {
    const story = storyBody(ctx, intent);
    return {
      id: nextId("story"),
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
    };
  }

  if (slot === "farm_stand") {
    if (ctx.businessMode === "FOOD_BUSINESS") return null;
    if (ctx.hasFarmStand || pages(intent).has("FARM_STAND") || recipe === "local_visit") {
      return {
        id: nextId("stand"),
        type: "FarmStand",
        heading: "Visit the stand",
        visibility: ctx.hasFarmStand ? "ALL" : "EDITOR_ONLY",
        placeholderKind: ctx.hasFarmStand ? undefined : "SETUP_STUB",
      };
    }
  }

  if (slot === "how_it_works") {
    return {
      id: nextId("how"),
      type: "Text",
      heading: "How it works",
      body: "Browse this week’s offering, place your order online, then pick up or get delivery.",
      copyKind: "GENERIC",
      placeholderKind: "COPY_GENERIC",
    };
  }

  if (slot === "trust") {
    if (pages(intent).has("REVIEWS") || ctx.reviewCount > 0 || recipe === "story_led") {
      return {
        id: nextId("reviews"),
        type: "Reviews",
        heading: "What customers say",
        dataSource: "TOP_REVIEWS",
        visibility: ctx.reviewCount > 0 ? "ALL" : "EDITOR_ONLY",
        placeholderKind: ctx.reviewCount > 0 ? undefined : "SETUP_STUB",
      };
    }
  }

  if (slot === "pickup" && (c.has("PICKUP") || c.has("DELIVERY") || recipe === "local_visit")) {
    return {
      id: nextId("pickup"),
      type: "Pickup",
      heading: ctx.hasFarmStand ? "Location & pickup" : "Pickup & delivery",
      dataSource: c.has("DELIVERY") ? "DELIVERY_ZONES" : "PICKUP_OPTIONS",
      visibility: ctx.hasPickup || ctx.hasDelivery ? "ALL" : "EDITOR_ONLY",
      placeholderKind: ctx.hasPickup || ctx.hasDelivery ? undefined : "SETUP_STUB",
    };
  }

  if (slot === "signup") {
    return {
      id: nextId("signup"),
      type: "Signup",
      heading: ctx.hasFarmStand ? "Join the farm list" : "Stay in the loop",
      body: "Get updates when new products and menus are available.",
      ctaLabel: "Subscribe",
      dataSource: "SIGNUP_DESTINATION",
      copyKind: "GENERIC",
    };
  }

  if (slot === "subscriptions" && c.has("SUBSCRIPTIONS")) {
    return {
      id: nextId("subs"),
      type: "Text",
      heading: "Subscriptions",
      body: "Set up subscriptions in Vendl to offer boxes and recurring orders.",
      visibility: "EDITOR_ONLY",
      placeholderKind: "SETUP_STUB",
      copyKind: "INSTRUCTIONAL",
    };
  }

  return null;
}

function homeSections(
  ctx: WebsiteBusinessContext,
  templateId: StudioTemplateId,
  intent?: WebsiteGenerationIntent,
): AiSectionConfig[] {
  const focus = intent?.primaryGoal ?? "";
  const c = caps(ctx, intent);
  const recipe = resolveRecipe(ctx, intent);
  const blueprint = resolveWebsiteBlueprint(intent?.blueprintId);
  const sections: AiSectionConfig[] = [];
  const i = { n: 0 };

  sections.push({
    id: sid("hero", i.n++),
    type: "Hero",
    headline: ctx.headline,
    subheadline: ctx.subheadline ?? undefined,
    ctaLabel:
      focus === "farm-stand"
        ? "Visit the stand"
        : focus === "preorders"
          ? "Order this week"
          : "Browse",
    preset:
      (blueprint
        ? heroPresetFromBlueprintHero(blueprint.layout.hero)
        : undefined) ??
      blueprint?.preferredPresets.Hero ??
      heroPresetForRecipe(recipe, templateId),
    copyKind: "GENERIC",
    placeholderKind: intent?.useAiDecorativePlaceholders
      ? "IMAGE_DECORATIVE"
      : undefined,
  });

  const seen = new Set<HomeSlot>();
  for (const slot of resolveHomeSlots(ctx, intent, recipe)) {
    if (seen.has(slot)) continue;
    seen.add(slot);
    const section = buildSlot(slot, ctx, templateId, intent, c, recipe, i);
    if (section) {
      const preferred = blueprint?.preferredPresets[section.type];
      if (preferred) section.preset = preferred;
      sections.push(section);
    }
  }

  // Always-on core: commerce + story + trust/fulfilment + signup if missing
  const types = new Set(sections.map((s) => s.type));
  if (!types.has("ProductGrid") && !types.has("NextDrop")) {
    const commerce = buildSlot("commerce", ctx, templateId, intent, c, recipe, i);
    if (commerce) sections.splice(1, 0, commerce);
  }
  if (!types.has("ImageText") && !types.has("About")) {
    const story = buildSlot("story", ctx, templateId, intent, c, recipe, i);
    if (story) sections.push(story);
  }
  if (!types.has("Reviews") && !types.has("Pickup") && !types.has("FarmStand")) {
    const trust =
      buildSlot("trust", ctx, templateId, intent, c, recipe, i) ??
      buildSlot("pickup", ctx, templateId, intent, c, recipe, i);
    if (trust) sections.push(trust);
  }
  if (!types.has("Signup")) {
    const signup = buildSlot("signup", ctx, templateId, intent, c, recipe, i);
    if (signup) sections.push(signup);
  }
  if (c.has("SUBSCRIPTIONS") && !sections.some((s) => s.id.startsWith("subs"))) {
    const subs = buildSlot("subscriptions", ctx, templateId, intent, c, recipe, i);
    if (subs) sections.push(subs);
  }

  while (sections.length > 10) sections.splice(sections.length - 2, 1);
  while (sections.length < 5) {
    sections.splice(sections.length - 1, 0, {
      id: sid("text", i.n++),
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
  _ctx: WebsiteBusinessContext,
): AISitePlan["navigation"] {
  const p = pages(intent);
  const nav: AISitePlan["navigation"] = [{ label: "Home", pageType: "HOME" }];
  if (p.has("SHOP")) nav.push({ label: "Shop", pageType: "SHOP" });
  if (p.has("FARM_STAND")) {
    nav.push({ label: "Farm stand", pageType: "FARM_STAND" });
  }
  if (p.has("MENU")) nav.push({ label: "Menus", pageType: "MENU" });
  if (p.has("ABOUT")) nav.push({ label: "About", pageType: "ABOUT" });
  if (p.has("CONTACT")) nav.push({ label: "Contact", pageType: "CONTACT" });
  if (p.has("FAQ")) nav.push({ label: "FAQ", pageType: "FAQ" });
  if (p.has("BLOG")) nav.push({ label: "Blog", pageType: "BLOG" });
  if (p.has("REVIEWS")) nav.push({ label: "Reviews", pageType: "REVIEWS" });
  if (p.has("EVENTS")) nav.push({ label: "Events", pageType: "EVENTS" });
  if (p.has("SUBSCRIPTIONS")) {
    nav.push({ label: "Subscriptions", pageType: "SUBSCRIPTIONS" });
  }
  // Policy pages stay in the footer — keep header nav lean for Astra schema.
  return nav.slice(0, 12);
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
  const { businessContext: ctx } = input;
  let intent = input.intent;
  if (!intent?.blueprintId) {
    const rec = recommendWebsiteBlueprint(
      ctx,
      intent?.selectedPages ?? [],
      intent,
    );
    intent = { ...intent, blueprintId: rec.recommendedBlueprintId };
  }
  const designSystem = pickDesignSystem(ctx, intent);
  const recipe = resolveRecipe(ctx, intent);
  const blueprint = getWebsiteBlueprint(intent.blueprintId!);
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
    changeSummary: `Draft ${designSystem} · ${blueprint.name} starting style · ${recipe} layout focused on ${primaryGoal}${
      intent?.selectedCapabilities?.length
        ? ` · capabilities: ${intent.selectedCapabilities.join(", ")}`
        : ""
    }.`,
  };

  return { ok: true, plan, provider: "heuristic", model: "rules-v1" };
}
