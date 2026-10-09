import type { WebsiteBusinessContext, WebsiteGenerationIntent } from "@/lib/website-ai/types";
import {
  isWebsiteBlueprintId,
  type BlueprintRecommendation,
  type BlueprintRecommendReason,
  type WebsiteBlueprintId,
} from "./types";
import { getWebsiteBlueprint } from "./registry";

const REASON_COPY: Record<BlueprintRecommendReason, string> = {
  LARGE_CATALOGUE: "your store has a larger catalogue and multiple categories",
  STRONG_PHOTOGRAPHY: "you already have strong product photography",
  LOCAL_PHYSICAL_SELLING: "you sell locally with a stand or pickup",
  STORY_RICH: "your business has a strong story to tell",
  CUSTOM_PRODUCT_BUSINESS: "you make or customise products by hand",
  PREMIUM_SMALL_CATALOGUE: "you have a smaller, more curated range",
  GENERAL_ECOMMERCE: "a versatile storefront fits how you sell",
  PREORDER_MENU: "you run menus or weekly preorders",
  SELLER_STYLE_HINT: "it matches the feel you asked for",
};

function styleHint(intent?: WebsiteGenerationIntent): WebsiteBlueprintId | null {
  const style = intent?.stylePreference?.toLowerCase() ?? "";
  if (!style) return null;
  if (style.includes("premium") || style.includes("handcrafted")) return "boutique";
  if (style.includes("bold") || style.includes("energetic")) return "bold";
  if (style.includes("warm") || style.includes("local") || style.includes("rustic")) {
    return "local";
  }
  if (style.includes("modern") || style.includes("clean")) return "minimal";
  return null;
}

/**
 * Recommend a starting style from business context + seller intent.
 * Never a hard rule — Modern Store is the safe low-confidence fallback.
 */
export function recommendWebsiteBlueprint(
  businessContext: WebsiteBusinessContext,
  selectedPages: string[] = [],
  intent?: WebsiteGenerationIntent,
): BlueprintRecommendation {
  const reasons: BlueprintRecommendReason[] = [];
  let id: WebsiteBlueprintId = "modern-store";
  let confidence: BlueprintRecommendation["confidence"] = "low";

  const hinted = styleHint(intent);
  if (hinted) {
    id = hinted;
    confidence = "medium";
    reasons.push("SELLER_STYLE_HINT");
  } else if (businessContext.productCount >= 24 || businessContext.categoryCount >= 6) {
    id = "catalogue";
    confidence = "high";
    reasons.push("LARGE_CATALOGUE");
  } else if (businessContext.hasFarmStand || intent?.primaryGoal === "farm-stand") {
    id = "local";
    confidence = "high";
    reasons.push("LOCAL_PHYSICAL_SELLING");
  } else if (
    businessContext.hasMenus ||
    intent?.primaryGoal === "preorders" ||
    intent?.primaryGoal === "menu"
  ) {
    id = "heritage";
    confidence = "medium";
    reasons.push("PREORDER_MENU");
  } else if (
    businessContext.productCount > 0 &&
    businessContext.productCount <= 8 &&
    businessContext.productPhotoCount >= Math.max(1, businessContext.productCount - 1)
  ) {
    id = "boutique";
    confidence = "medium";
    reasons.push("PREMIUM_SMALL_CATALOGUE", "STRONG_PHOTOGRAPHY");
  } else if ((businessContext.about?.length ?? 0) > 120) {
    id = "studio";
    confidence = "medium";
    reasons.push("STORY_RICH");
  } else if (businessContext.categoryCount >= 3) {
    id = "marketplace";
    confidence = "medium";
    reasons.push("LARGE_CATALOGUE");
  } else if (selectedPages.includes("FARM_STAND")) {
    id = "local";
    confidence = "medium";
    reasons.push("LOCAL_PHYSICAL_SELLING");
  } else {
    id = "modern-store";
    confidence = "low";
    reasons.push("GENERAL_ECOMMERCE");
  }

  // Phase 8D.1 §11: deprioritise image-led styles when the seller has few photos.
  const needs = getWebsiteBlueprint(id).assetNeeds;
  if (
    businessContext.productPhotoCount < needs.minPhotos &&
    (id === "editorial" || id === "minimal" || id === "studio" || id === "boutique")
  ) {
    id = "modern-store";
    confidence = "medium";
    if (!reasons.includes("GENERAL_ECOMMERCE")) reasons.push("GENERAL_ECOMMERCE");
  }

  const primary = reasons[0] ?? "GENERAL_ECOMMERCE";
  return {
    recommendedBlueprintId: id,
    confidence,
    reasonCodes: reasons,
    userFacingReason: `Recommended because ${REASON_COPY[primary]}.`,
  };
}

export function resolveBlueprintChoice(
  choice: string | null | undefined,
  recommendation: BlueprintRecommendation,
): { blueprintId: WebsiteBlueprintId; fromAiDefault: boolean } {
  const raw = (choice ?? "").trim();
  if (!raw || raw === "vendl-choose") {
    return {
      blueprintId: recommendation.recommendedBlueprintId,
      fromAiDefault: true,
    };
  }
  if (!isWebsiteBlueprintId(raw)) {
    return {
      blueprintId: recommendation.recommendedBlueprintId,
      fromAiDefault: true,
    };
  }
  return {
    blueprintId: raw,
    fromAiDefault: false,
  };
}
