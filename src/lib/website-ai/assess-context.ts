import type { WebsiteBusinessContext, WebsiteGenerationIntent } from "./types";

export type ContextQuality = "GOOD" | "WEAK" | "UNKNOWN" | "MISSING";

export type WebsiteIntakeNeeds = {
  /** Only for sparse accounts — blank About is not enough to interrupt. */
  askAbout: boolean;
  /** Optional soft photo prompt; never blocks generation. */
  askHeroImage: boolean;
  askStoryImage: boolean;
  existingAbout: string;
  hasHeroImage: boolean;
  productPhotosReady: boolean;
};

export type WebsiteContextAssessment = {
  readiness: "READY" | "NEEDS_CONTEXT" | "SPARSE";
  dimensions: Record<string, ContextQuality>;
  focusOptions: { id: string; label: string }[];
  knownFacts: string[];
  suggestedQuestions: string[];
  intake: WebsiteIntakeNeeds;
  path: "A" | "B" | "C";
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
    photography: quality(
      Boolean(ctx.heroImageUrl),
      ctx.productPhotoCount > 0,
    ),
    location: quality(Boolean(ctx.regionLabel)),
    fulfilment: quality(ctx.hasPickup || ctx.hasDelivery || ctx.hasFarmStand),
    socialProof: quality(ctx.reviewCount >= 2, ctx.reviewCount > 0),
  };

  const goodCount = Object.values(dimensions).filter((d) => d === "GOOD").length;
  const readiness =
    goodCount >= 6 ? "READY" : goodCount >= 3 ? "NEEDS_CONTEXT" : "SPARSE";
  const path = readiness === "READY" ? "A" : readiness === "NEEDS_CONTEXT" ? "B" : "C";

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
  if (ctx.productCount > 0) {
    focusOptions.push({
      id: "shop",
      label: ctx.hasFarmStand ? "Fresh products" : "Online shop",
    });
  }
  focusOptions.push({ id: "story", label: "Tell our story" });

  // Deduplicate by id while preserving order
  const seen = new Set<string>();
  const uniqueFocus = focusOptions.filter((o) => {
    if (seen.has(o.id)) return false;
    seen.add(o.id);
    return true;
  });

  const knownFacts = buildKnownFacts(ctx);
  const suggestedQuestions: string[] = [];
  if (path === "C") {
    suggestedQuestions.push("What do you sell and what makes your business special?");
  }

  // Generate-early: blank About / weak story does NOT interrupt Path A/B.
  // Sparse Path C may ask one story question. Optional photo never blocks.
  const intake: WebsiteIntakeNeeds = {
    askAbout: path === "C",
    askHeroImage: !ctx.heroImageUrl && ctx.productPhotoCount > 0,
    askStoryImage: false,
    existingAbout: ctx.about ?? "",
    hasHeroImage: Boolean(ctx.heroImageUrl),
    productPhotosReady: ctx.productPhotoCount > 0,
  };

  return {
    readiness,
    dimensions,
    focusOptions: uniqueFocus,
    knownFacts,
    suggestedQuestions,
    intake,
    path,
  };
}

export function intentFromForm(input: {
  focus?: string;
  style?: string;
  notes?: string;
  about?: string;
  storyImageUrl?: string;
}): WebsiteGenerationIntent {
  return {
    primaryGoal: input.focus && input.focus !== "vendl-decide" ? input.focus : undefined,
    stylePreference:
      input.style && input.style !== "vendl-decide" ? input.style : undefined,
    sellerNotes: input.notes?.trim() || undefined,
    sellerAbout: input.about?.trim() || undefined,
    storyImageUrl: input.storyImageUrl?.trim() || undefined,
  };
}
