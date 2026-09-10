import type { WebsiteBusinessContext } from "./types";

export const WEBSITE_CAPABILITY_IDS = [
  "SHOP",
  "MENUS_PREORDERS",
  "SUBSCRIPTIONS",
  "CUSTOM_ORDER_FORMS",
  "PICKUP",
  "DELIVERY",
  "EVENTS",
  "NEWSLETTER",
] as const;

export type WebsiteCapabilityId = (typeof WEBSITE_CAPABILITY_IDS)[number];

export const PAID_CAPABILITIES: WebsiteCapabilityId[] = [
  "SHOP",
  "MENUS_PREORDERS",
  "SUBSCRIPTIONS",
  "CUSTOM_ORDER_FORMS",
];

export type SiteShapePageId =
  | "HOME"
  | "ABOUT"
  | "CONTACT"
  | "FAQ"
  | "SHOP"
  | "FARM_STAND"
  | "REVIEWS"
  | "BLOG"
  | "PRIVACY"
  | "TERMS"
  | "REFUNDS"
  | "DELIVERY_POLICY";

export type CheckboxOption = {
  id: string;
  label: string;
  defaultChecked: boolean;
  disabled?: boolean;
  hint?: string;
};

/** Sparse defaults + live-aware defaults for READY / NEEDS_CONTEXT. */
export function defaultCapabilities(
  ctx: WebsiteBusinessContext,
  readiness: "READY" | "NEEDS_CONTEXT" | "SPARSE",
  focus?: string,
): CheckboxOption[] {
  const live = readiness !== "SPARSE";
  return [
    {
      id: "SHOP",
      label: "Online shop / products",
      defaultChecked: live ? ctx.productCount > 0 : true,
    },
    {
      id: "MENUS_PREORDERS",
      label: "Weekly preorders / menus",
      defaultChecked: live
        ? ctx.hasMenus
        : focus === "preorders" || focus === "menu",
    },
    {
      id: "SUBSCRIPTIONS",
      label: "Subscriptions",
      defaultChecked: false,
    },
    {
      id: "CUSTOM_ORDER_FORMS",
      label: "Custom order forms",
      defaultChecked: false,
    },
    {
      id: "PICKUP",
      label: "Pickup",
      defaultChecked: live
        ? ctx.hasPickup
        : ctx.hasFarmStand || ctx.businessMode !== "FOOD_BUSINESS",
    },
    {
      id: "DELIVERY",
      label: "Delivery",
      defaultChecked: live ? ctx.hasDelivery : false,
    },
    {
      id: "EVENTS",
      label: "Events / markets",
      defaultChecked: false,
    },
    {
      id: "NEWSLETTER",
      label: "Newsletter signup",
      defaultChecked: true,
    },
  ];
}

export function defaultPages(
  ctx: WebsiteBusinessContext,
  readiness: "READY" | "NEEDS_CONTEXT" | "SPARSE",
  capabilities: Set<string>,
): CheckboxOption[] {
  const shopOn = capabilities.has("SHOP");
  const deliveryOn = capabilities.has("DELIVERY");
  const paid =
    capabilities.has("SHOP") ||
    capabilities.has("MENUS_PREORDERS") ||
    capabilities.has("SUBSCRIPTIONS") ||
    capabilities.has("CUSTOM_ORDER_FORMS");

  return [
    { id: "HOME", label: "Home", defaultChecked: true, disabled: true },
    { id: "ABOUT", label: "About", defaultChecked: true },
    { id: "CONTACT", label: "Contact", defaultChecked: true },
    { id: "FAQ", label: "FAQ", defaultChecked: true },
    {
      id: "SHOP",
      label: "Shop",
      defaultChecked: shopOn,
      disabled: !shopOn,
      hint: shopOn ? undefined : "Enable Online shop first",
    },
    {
      id: "FARM_STAND",
      label: "Farm stand",
      defaultChecked: ctx.hasFarmStand,
      disabled: !ctx.hasFarmStand,
    },
    {
      id: "REVIEWS",
      label: "Reviews",
      defaultChecked: ctx.reviewCount > 0,
      disabled: ctx.reviewCount === 0,
      hint:
        ctx.reviewCount === 0 ? "Available once you have reviews" : undefined,
    },
    { id: "BLOG", label: "Blog", defaultChecked: false },
    { id: "PRIVACY", label: "Privacy policy", defaultChecked: true },
    {
      id: "TERMS",
      label: "Terms",
      defaultChecked: paid || readiness === "SPARSE",
    },
    {
      id: "REFUNDS",
      label: "Refund policy",
      defaultChecked: paid,
    },
    {
      id: "DELIVERY_POLICY",
      label: "Delivery policy",
      defaultChecked: deliveryOn,
      disabled: !deliveryOn,
    },
  ];
}

export function isCapabilityId(value: string): value is WebsiteCapabilityId {
  return (WEBSITE_CAPABILITY_IDS as readonly string[]).includes(value);
}
