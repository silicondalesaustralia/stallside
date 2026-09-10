import type { WebsiteBusinessContext, WebsiteGenerationIntent } from "./types";
import {
  defaultCapabilities,
  defaultPages,
  isCapabilityId,
  type CheckboxOption,
  type WebsiteCapabilityId,
} from "./capabilities";

export type ContextQuality = "GOOD" | "WEAK" | "UNKNOWN" | "MISSING";
export type WebsiteReadiness = "READY" | "NEEDS_CONTEXT" | "SPARSE";

export type WebsiteIntakeNeeds = {
  askStory: boolean;
  askArea: boolean;
  existingAbout: string;
  hasHeroImage: boolean;
  productPhotosReady: boolean;
  showDecorativeImageOption: boolean;
  nudgeDecorativeImages: boolean;
  showSampleProductsOption: boolean;
};

export type SiteShapeMode = "skipped" | "collapsed" | "expanded";

export type WebsiteContextAssessment = {
  readiness: WebsiteReadiness;
  dimensions: Record<string, ContextQuality>;
  focusOptions: { id: string; label: string }[];
  knownFacts: string[];
  suggestedQuestions: string[];
  intake: WebsiteIntakeNeeds;
  path: "A" | "B" | "C";
  siteShapeMode: SiteShapeMode;
  pageOptions: CheckboxOption[];
  capabilityOptions: CheckboxOption[];
  siteShapeSummary: string;
};

function quality(good: boolean, weak?: boolean): ContextQuality {
  if (good) return "GOOD";
  if (weak) return "WEAK";
  return "MISSING";
}

export function buildKnownFacts(ctx: WebsiteBusinessContext): string[] {
  const facts: string[] = [];
  if (ctx.productCount > 0) facts.push("Your products");
  if (ctx.hasFarmStand) facts.push("Farm stand");
  if (ctx.hasMenus) facts.push("Weekly preorders");
  if (ctx.hasPickup) facts.push("Pickup");
  if (ctx.hasDelivery) facts.push("Local delivery");
  if (ctx.reviewCount > 0) facts.push("Reviews");
  if (ctx.logoUrl || ctx.heroImageUrl || ctx.productPhotoCount > 0) {
    facts.push("Brand images");
  }
  if (ctx.regionLabel) facts.push(`Location (${ctx.regionLabel})`);
  return facts;
}

export function assessWebsiteContext(
  ctx: WebsiteBusinessContext,
): WebsiteContextAssessment {
  const dimensions = {
    businessIdentity: quality(Boolean(ctx.businessName)),
    products: quality(ctx.productCount >= 3, ctx.productCount > 0),
    commerceSetup: quality(ctx.hasPickup || ctx.hasDelivery || ctx.hasFarmStand),
    primaryGoal: "UNKNOWN" as ContextQuality,
    businessStory: quality(
      Boolean(ctx.about && ctx.about.length > 40),
      Boolean(ctx.about),
    ),
    brandAssets: quality(Boolean(ctx.logoUrl)),
    photography: quality(Boolean(ctx.heroImageUrl), ctx.productPhotoCount > 0),
    location: quality(Boolean(ctx.regionLabel)),
    fulfilment: quality(ctx.hasPickup || ctx.hasDelivery || ctx.hasFarmStand),
    socialProof: quality(ctx.reviewCount >= 2, ctx.reviewCount > 0),
  };

  const goodCount = Object.values(dimensions).filter((d) => d === "GOOD").length;
  const readiness: WebsiteReadiness =
    goodCount >= 6 ? "READY" : goodCount >= 3 ? "NEEDS_CONTEXT" : "SPARSE";
  const path = readiness === "READY" ? "A" : readiness === "NEEDS_CONTEXT" ? "B" : "C";
  const siteShapeMode: SiteShapeMode =
    readiness === "READY" ? "skipped" : readiness === "NEEDS_CONTEXT" ? "collapsed" : "expanded";

  const focusOptions: { id: string; label: string }[] = [
    { id: "vendl-decide", label: "Let Vendl decide" },
  ];
  if (ctx.hasFarmStand) focusOptions.push({ id: "farm-stand", label: "Farm stand" });
  if (ctx.hasMenus) {
    focusOptions.push({ id: "preorders", label: "Weekly preorders" });
    if (ctx.businessMode !== "FARM_STAND") {
      focusOptions.push({ id: "menu", label: "This week's menu" });
    }
  }
  focusOptions.push({
    id: "shop",
    label: ctx.hasFarmStand ? "Fresh products" : "Online shop",
  });
  focusOptions.push({ id: "story", label: "Tell our story" });

  const seen = new Set<string>();
  const uniqueFocus = focusOptions.filter((o) => {
    if (seen.has(o.id)) return false;
    seen.add(o.id);
    return true;
  });

  const capabilityOptions = defaultCapabilities(ctx, readiness);
  const defaultCapIds = new Set(
    capabilityOptions.filter((c) => c.defaultChecked).map((c) => c.id),
  );
  const pageOptions = defaultPages(ctx, readiness, defaultCapIds);
  const siteShapeSummary = pageOptions
    .filter((p) => p.defaultChecked)
    .map((p) => p.label)
    .join(", ");

  const askStory =
    readiness === "SPARSE" &&
    !ctx.about &&
    ctx.productCount === 0;
  const askArea =
    (readiness === "SPARSE" || readiness === "NEEDS_CONTEXT") &&
    !ctx.regionLabel &&
    (defaultCapIds.has("PICKUP") ||
      defaultCapIds.has("DELIVERY") ||
      ctx.hasFarmStand);

  return {
    readiness,
    dimensions,
    focusOptions: uniqueFocus,
    knownFacts: buildKnownFacts(ctx),
    suggestedQuestions: askStory
      ? ["In a sentence or two, what do you make or grow?"]
      : [],
    intake: {
      askStory,
      askArea: askArea && !askStory, // max priority: story first; area if story not needed
      existingAbout: ctx.about ?? "",
      hasHeroImage: Boolean(ctx.heroImageUrl),
      productPhotosReady: ctx.productPhotoCount > 0,
      showDecorativeImageOption: true,
      nudgeDecorativeImages:
        readiness === "SPARSE" && !ctx.heroImageUrl && ctx.productPhotoCount === 0,
      showSampleProductsOption: defaultCapIds.has("SHOP") && ctx.productCount === 0,
    },
    path,
    siteShapeMode,
    pageOptions,
    capabilityOptions,
    siteShapeSummary,
  };
}

function parseChecked(form: FormData, prefix: string): string[] {
  const values: string[] = [];
  for (const [key, value] of form.entries()) {
    if (key === prefix || key.startsWith(`${prefix}[`)) {
      const v = String(value);
      if (v) values.push(v);
    }
  }
  // Also support multiple same-name fields
  const all = form.getAll(prefix).map(String).filter(Boolean);
  return [...new Set([...values, ...all])];
}

export function intentFromForm(
  formData: FormData,
  assessment: WebsiteContextAssessment,
): WebsiteGenerationIntent {
  const focus = String(formData.get("focus") ?? "");
  const style = String(formData.get("style") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  const about = String(formData.get("about") ?? "").trim();
  const storyAnswer = String(formData.get("contextStory") ?? "").trim();
  const areaAnswer = String(formData.get("contextArea") ?? "").trim();

  let pages = parseChecked(formData, "page");
  let caps = parseChecked(formData, "capability");

  if (pages.length === 0) {
    pages = assessment.pageOptions.filter((p) => p.defaultChecked).map((p) => p.id);
  }
  if (caps.length === 0) {
    caps = assessment.capabilityOptions
      .filter((c) => c.defaultChecked)
      .map((c) => c.id);
  }
  if (!pages.includes("HOME")) pages = ["HOME", ...pages];

  const selectedCapabilities = caps.filter(isCapabilityId) as WebsiteCapabilityId[];

  const contextAnswers: WebsiteGenerationIntent["contextAnswers"] = [];
  if (storyAnswer) contextAnswers.push({ questionId: "STORY", answer: storyAnswer });
  if (areaAnswer) contextAnswers.push({ questionId: "AREA", answer: areaAnswer });

  return {
    primaryGoal: focus && focus !== "vendl-decide" ? focus : undefined,
    stylePreference: style && style !== "vendl-decide" ? style : undefined,
    sellerNotes: notes || undefined,
    sellerAbout: about || storyAnswer || undefined,
    contextAnswers,
    selectedPages: pages,
    selectedCapabilities,
    useAiDecorativePlaceholders: formData.get("aiPlaceholders") === "on",
    includeSampleProducts: formData.get("sampleProducts") === "on",
  };
}
