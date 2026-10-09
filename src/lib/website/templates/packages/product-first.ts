import type { TemplatePackage } from "../package-schema";

export const PRODUCT_FIRST: TemplatePackage = {
  schemaVersion: 1,
  id: "product-first",
  version: 1,
  name: "Product first",
  summary: "Your products front and centre, with categories and pickup details close by.",
  bestFor: "Sellers with a steady range who want customers shopping straight away.",
  skin: "market",
  businessModes: ["FARM_STAND", "FOOD_BUSINESS", "BOTH"],
  pages: {
    home: [
      {
        slot: "hero",
        type: "hero",
        variant: "shop-first",
        props: {
          headline: "{{business.headline}}",
          supportingText: "{{business.subheadline}}",
          ctaLabel: "Shop now",
        },
      },
      {
        slot: "products",
        type: "productGrid",
        variant: "shop-grid",
        props: { heading: "Shop our range", limit: 12, columns: 4 },
      },
      { slot: "categories", type: "categories", variant: "shop-cards", props: { heading: "Browse by category" } },
      {
        slot: "menu",
        type: "nextDrop",
        variant: "current-menu",
        businessModes: ["FOOD_BUSINESS", "BOTH"],
        props: { heading: "This week's menu" },
      },
      { slot: "reviews", type: "reviews", variant: "cards", props: { heading: "What customers say" } },
      { slot: "pickup", type: "pickup", variant: "cards", props: { heading: "Pickup & delivery" } },
    ],
    shop: [
      { slot: "categories", type: "categories", variant: "shop-cards", props: { heading: "Browse" } },
      {
        slot: "products",
        type: "productGrid",
        variant: "shop-grid",
        props: { heading: "Shop", limit: 24, columns: 4 },
      },
    ],
  },
};
