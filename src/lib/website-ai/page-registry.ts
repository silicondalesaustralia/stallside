import type { WebsitePageType } from "./types";

export type WebsitePageDefinition = {
  type: WebsitePageType;
  aiCreatable: boolean;
  aiDeletable: boolean;
  aiComposable: boolean;
  routeStrategy: "fixed" | "generated-slug" | "entity";
  minSections?: number;
  maxSections?: number;
};

export const WEBSITE_PAGE_REGISTRY: Record<WebsitePageType, WebsitePageDefinition> =
  {
    HOME: {
      type: "HOME",
      aiCreatable: true,
      aiDeletable: false,
      aiComposable: true,
      routeStrategy: "fixed",
      minSections: 5,
      maxSections: 10,
    },
    ABOUT: {
      type: "ABOUT",
      aiCreatable: true,
      aiDeletable: true,
      aiComposable: true,
      routeStrategy: "fixed",
      minSections: 2,
      maxSections: 6,
    },
    CONTACT: {
      type: "CONTACT",
      aiCreatable: true,
      aiDeletable: true,
      aiComposable: true,
      routeStrategy: "fixed",
      minSections: 1,
      maxSections: 4,
    },
    FAQ: {
      type: "FAQ",
      aiCreatable: true,
      aiDeletable: true,
      aiComposable: true,
      routeStrategy: "fixed",
      minSections: 1,
      maxSections: 3,
    },
    SHOP: {
      type: "SHOP",
      aiCreatable: false,
      aiDeletable: false,
      aiComposable: false,
      routeStrategy: "fixed",
    },
    CATEGORY: {
      type: "CATEGORY",
      aiCreatable: false,
      aiDeletable: false,
      aiComposable: false,
      routeStrategy: "entity",
    },
    PRODUCT: {
      type: "PRODUCT",
      aiCreatable: false,
      aiDeletable: false,
      aiComposable: false,
      routeStrategy: "entity",
    },
    MENU: {
      type: "MENU",
      aiCreatable: false,
      aiDeletable: false,
      aiComposable: false,
      routeStrategy: "entity",
    },
    SUBSCRIPTIONS: {
      type: "SUBSCRIPTIONS",
      aiCreatable: false,
      aiDeletable: false,
      aiComposable: false,
      routeStrategy: "fixed",
    },
    FARM_STAND: {
      type: "FARM_STAND",
      aiCreatable: false,
      aiDeletable: false,
      aiComposable: false,
      routeStrategy: "fixed",
    },
    EVENTS: {
      type: "EVENTS",
      aiCreatable: true,
      aiDeletable: true,
      aiComposable: true,
      routeStrategy: "generated-slug",
    },
    REVIEWS: {
      type: "REVIEWS",
      aiCreatable: true,
      aiDeletable: true,
      aiComposable: true,
      routeStrategy: "generated-slug",
    },
    BLOG_INDEX: {
      type: "BLOG_INDEX",
      aiCreatable: false,
      aiDeletable: false,
      aiComposable: false,
      routeStrategy: "fixed",
    },
    BLOG_POST: {
      type: "BLOG_POST",
      aiCreatable: false,
      aiDeletable: false,
      aiComposable: false,
      routeStrategy: "entity",
    },
    CUSTOM_INFO: {
      type: "CUSTOM_INFO",
      aiCreatable: true,
      aiDeletable: true,
      aiComposable: true,
      routeStrategy: "generated-slug",
      minSections: 1,
      maxSections: 8,
    },
    PRIVACY: {
      type: "PRIVACY",
      aiCreatable: false,
      aiDeletable: false,
      aiComposable: false,
      routeStrategy: "fixed",
    },
    TERMS: {
      type: "TERMS",
      aiCreatable: false,
      aiDeletable: false,
      aiComposable: false,
      routeStrategy: "fixed",
    },
    SHIPPING_PICKUP: {
      type: "SHIPPING_PICKUP",
      aiCreatable: false,
      aiDeletable: false,
      aiComposable: false,
      routeStrategy: "fixed",
    },
    REFUNDS: {
      type: "REFUNDS",
      aiCreatable: false,
      aiDeletable: false,
      aiComposable: false,
      routeStrategy: "fixed",
    },
  };

export function aiComposablePageTypes(): WebsitePageType[] {
  return (Object.keys(WEBSITE_PAGE_REGISTRY) as WebsitePageType[]).filter(
    (t) => WEBSITE_PAGE_REGISTRY[t].aiComposable,
  );
}
