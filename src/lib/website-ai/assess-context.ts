import type { WebsiteBusinessContext, WebsiteGenerationIntent } from "./types";

export type ContextQuality = "GOOD" | "WEAK" | "UNKNOWN" | "MISSING";

export type WebsiteContextAssessment = {
  readiness: "READY" | "NEEDS_CONTEXT" | "SPARSE";
  dimensions: Record<string, ContextQuality>;
  focusOptions: { id: string; label: string }[];
  suggestedQuestions: string[];
};

function quality(
  good: boolean,
  weak?: boolean,
): ContextQuality {
  if (good) return "GOOD";
  if (weak) return "WEAK";
  return "MISSING";
}

export function assessWebsiteContext(
  ctx: WebsiteBusinessContext,
): WebsiteContextAssessment {
  const dimensions = {
    businessIdentity: quality(Boolean(ctx.businessName)),
    products: quality(ctx.productCount >= 3, ctx.productCount > 0),
    commerceSetup: quality(ctx.hasPickup || ctx.hasDelivery || ctx.hasFarmStand),
    primaryGoal: "UNKNOWN" as ContextQuality,
    businessStory: quality(Boolean(ctx.about && ctx.about.length > 40), Boolean(ctx.about)),
    brandAssets: quality(Boolean(ctx.logoUrl)),
    photography: quality(Boolean(ctx.heroImageUrl)),
    location: quality(Boolean(ctx.regionLabel)),
    fulfilment: quality(ctx.hasPickup || ctx.hasDelivery || ctx.hasFarmStand),
    socialProof: quality(ctx.reviewCount >= 2, ctx.reviewCount > 0),
  };

  const goodCount = Object.values(dimensions).filter((d) => d === "GOOD").length;
  const readiness =
    goodCount >= 6 ? "READY" : goodCount >= 3 ? "NEEDS_CONTEXT" : "SPARSE";

  const focusOptions: { id: string; label: string }[] = [
    { id: "vendl-decide", label: "Let Vendl decide" },
  ];
  if (ctx.hasFarmStand) focusOptions.push({ id: "farm-stand", label: "Farm stand" });
  if (ctx.hasMenus) focusOptions.push({ id: "preorders", label: "Weekly preorders" });
  if (ctx.productCount > 0) focusOptions.push({ id: "shop", label: "Selling products" });
  focusOptions.push({ id: "story", label: "Tell our story" });

  const suggestedQuestions: string[] = [];
  if (dimensions.primaryGoal === "UNKNOWN") {
    suggestedQuestions.push("What should customers do first when they visit?");
  }
  if (dimensions.businessStory !== "GOOD") {
    suggestedQuestions.push("What makes your business different?");
  }

  return { readiness, dimensions, focusOptions, suggestedQuestions };
}

export function intentFromForm(input: {
  focus?: string;
  style?: string;
  notes?: string;
}): WebsiteGenerationIntent {
  return {
    primaryGoal: input.focus && input.focus !== "vendl-decide" ? input.focus : undefined,
    stylePreference: input.style && input.style !== "vendl-decide" ? input.style : undefined,
    sellerNotes: input.notes?.trim() || undefined,
  };
}
