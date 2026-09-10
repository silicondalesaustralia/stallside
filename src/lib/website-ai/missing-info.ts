import type { WebsiteBusinessContext, WebsiteGenerationIntent } from "./types";
import type { WebsiteCapabilityId } from "./capabilities";
import { PAID_CAPABILITIES } from "./capabilities";

export type MissingInfoSeverity = "MUST_FIX" | "NOT_LIVE" | "IMPROVES_SITE";

export type MissingInfoItem = {
  id: string;
  severity: MissingInfoSeverity;
  label: string;
  settingsLink?: string;
};

/** Deterministic — never trust the model for missing-info lists. */
export function computeMissingInformation(
  ctx: WebsiteBusinessContext,
  intent: WebsiteGenerationIntent,
): MissingInfoItem[] {
  const items: MissingInfoItem[] = [];
  const caps = new Set(intent.selectedCapabilities ?? []);

  if (!ctx.about && !intent.sellerAbout) {
    items.push({
      id: "NO_ABOUT",
      severity: "MUST_FIX",
      label: "Write your story on the About page (instructional copy must be replaced before publish)",
      settingsLink: "/dashboard/website/details",
    });
  }

  if (caps.has("SHOP") && ctx.productCount === 0) {
    items.push({
      id: "NO_PRODUCTS",
      severity: "NOT_LIVE",
      label: "Add your first product — Shop appears to visitors once you do",
      settingsLink: "/dashboard/products",
    });
  }

  if (caps.has("SUBSCRIPTIONS")) {
    items.push({
      id: "CAPABILITY_UNCONFIGURED:SUBSCRIPTIONS",
      severity: "NOT_LIVE",
      label: "Set up subscriptions — the section stays hidden until then",
      settingsLink: "/dashboard/subscriptions",
    });
  }

  if (caps.has("MENUS_PREORDERS") && !ctx.hasMenus) {
    items.push({
      id: "CAPABILITY_UNCONFIGURED:MENUS_PREORDERS",
      severity: "NOT_LIVE",
      label: "Set up weekly menus — preorder sections stay hidden until then",
      settingsLink: "/dashboard/menus",
    });
  }

  if (caps.has("CUSTOM_ORDER_FORMS")) {
    items.push({
      id: "CAPABILITY_UNCONFIGURED:CUSTOM_ORDER_FORMS",
      severity: "NOT_LIVE",
      label: "Create an order form — the section stays hidden until then",
      settingsLink: "/dashboard/custom-orders",
    });
  }

  if (!ctx.heroImageUrl && !intent.useAiDecorativePlaceholders) {
    items.push({
      id: "NO_HERO_IMAGE",
      severity: "IMPROVES_SITE",
      label: "Add a farm or business photo to strengthen the homepage",
      settingsLink: "/dashboard/website/details",
    });
  }

  const wantsPaid = PAID_CAPABILITIES.some((c) => caps.has(c as WebsiteCapabilityId));
  if (wantsPaid) {
    items.push({
      id: "POLICY_REFUNDS",
      severity: "NOT_LIVE",
      label: "Set your refund window — Refund policy stays hidden until then",
      settingsLink: "/dashboard/fulfilment",
    });
  }

  return items.slice(0, 8);
}
