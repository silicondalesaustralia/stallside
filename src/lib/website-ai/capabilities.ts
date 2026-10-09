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
  /** Short note under the label — what this adds to the site. */
  description?: string;
  /** Lock / status message (e.g. why disabled). */
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
      description:
        "Product grid and a Shop page so customers can browse and buy. You can edit after creation.",
    },
    {
      id: "MENUS_PREORDERS",
      label: "Weekly preorders / menus",
      defaultChecked: live
        ? ctx.hasMenus
        : focus === "preorders" || focus === "menu",
      description:
        "Highlights this week’s menu and preorder drops on the homepage.",
    },
    {
      id: "SUBSCRIPTIONS",
      label: "Subscriptions",
      defaultChecked: false,
      description:
        "Shows your subscription products and recurring box offers when you have them set up.",
    },
    {
      id: "CUSTOM_ORDER_FORMS",
      label: "Custom order forms",
      defaultChecked: false,
      description:
        "Space for enquiry or custom-order forms you connect later in Vendl.",
    },
    {
      id: "PICKUP",
      label: "Pickup",
      defaultChecked: live
        ? ctx.hasPickup
        : ctx.hasFarmStand || ctx.businessMode !== "FOOD_BUSINESS",
      description: "Explains how customers collect orders from you.",
    },
    {
      id: "DELIVERY",
      label: "Delivery",
      defaultChecked: live ? ctx.hasDelivery : false,
      description: "Explains delivery options and where you deliver.",
    },
    {
      id: "EVENTS",
      label: "Events / markets",
      defaultChecked: false,
      description: "Room for markets and events you want customers to know about.",
    },
    {
      id: "NEWSLETTER",
      label: "Newsletter signup",
      defaultChecked: true,
      description: "A signup block so people can join your email list.",
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
    {
      id: "HOME",
      label: "Home",
      defaultChecked: true,
      disabled: true,
      description:
        "Included on every site — hero, story and key sections. Edit layout after build.",
      hint: "Always included",
    },
    {
      id: "ABOUT",
      label: "About",
      defaultChecked: true,
      description:
        "A page with information about your business — you can edit the copy after creation.",
    },
    {
      id: "CONTACT",
      label: "Contact",
      defaultChecked: true,
      description: "How customers can get in touch with you.",
    },
    {
      id: "FAQ",
      label: "FAQ",
      defaultChecked: true,
      description:
        "Common questions about ordering, pickup and your products — editable later.",
    },
    {
      id: "SHOP",
      label: "Shop",
      defaultChecked: shopOn,
      // Unlockable by ticking Online shop below (or here — form syncs both).
      disabled: false,
      description:
        "A Shop page listing your products. Tick Online shop / products if it isn’t on yet.",
      hint: shopOn ? undefined : "Also turns on Online shop / products",
    },
    {
      id: "FARM_STAND",
      label: "Farm stand",
      defaultChecked: ctx.hasFarmStand,
      disabled: false,
      description: "Points visitors to your farm stand location and hours.",
      hint: !ctx.hasFarmStand
        ? "We’ll add a placeholder until you set up a farm stand"
        : undefined,
    },
    {
      id: "REVIEWS",
      label: "Reviews",
      defaultChecked: ctx.reviewCount > 0,
      disabled: false,
      description: "Shows customer reviews on your site when you have them.",
      hint:
        ctx.reviewCount === 0
          ? "We’ll add a placeholder until you have reviews"
          : undefined,
    },
    {
      id: "BLOG",
      label: "Blog",
      defaultChecked: false,
      description: "A blog index for news and updates you publish later.",
    },
    {
      id: "PRIVACY",
      label: "Privacy policy",
      defaultChecked: true,
      description:
        "A starter privacy policy page (not legal advice) — edit before publishing.",
    },
    {
      id: "TERMS",
      label: "Terms",
      defaultChecked: paid || readiness === "SPARSE",
      description:
        "A starter terms of service page (not legal advice) — edit before publishing.",
    },
    {
      id: "REFUNDS",
      label: "Refund policy",
      defaultChecked: paid,
      description: "A starter returns and refunds page you can customise.",
    },
    {
      id: "DELIVERY_POLICY",
      label: "Delivery policy",
      defaultChecked: deliveryOn,
      disabled: false,
      description: "Shipping, pickup and delivery policy details for customers.",
      hint: deliveryOn ? undefined : "Also turns on Delivery under selling",
    },
  ];
}

export function isCapabilityId(value: string): value is WebsiteCapabilityId {
  return (WEBSITE_CAPABILITY_IDS as readonly string[]).includes(value);
}
