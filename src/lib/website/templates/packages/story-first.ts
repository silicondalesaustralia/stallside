import type { TemplatePackage } from "../package-schema";

export const STORY_FIRST: TemplatePackage = {
  schemaVersion: 1,
  id: "story-first",
  version: 1,
  name: "Story first",
  summary: "Opens with who you are and how you work, then a short edit of your products.",
  bestFor: "Small producers whose story is part of why people buy.",
  skin: "artisan",
  businessModes: ["FARM_STAND", "FOOD_BUSINESS", "BOTH"],
  pages: {
    home: [
      {
        slot: "hero",
        type: "hero",
        variant: "editorial",
        props: {
          headline: "{{business.headline}}",
          supportingText: "{{business.subheadline}}",
          ctaLabel: "Our story",
        },
      },
      { slot: "about", type: "about", variant: "simple", props: { heading: "Our story", body: "{{business.about}}" } },
      {
        slot: "products",
        type: "productGrid",
        variant: "editorial",
        props: { heading: "A few favourites", limit: 6, columns: 3 },
      },
      { slot: "stand", type: "farmStand", props: { heading: "Visit us" } },
      { slot: "reviews", type: "reviews", variant: "quote", props: { heading: "What people say" } },
      {
        slot: "signup",
        type: "signup",
        props: { heading: "Stay in touch", body: "Seasonal news, new products and the odd recipe.", buttonLabel: "Subscribe" },
      },
    ],
  },
};
