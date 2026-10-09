import type { TemplatePackage } from "../package-schema";

export const WEEKLY_RELEASE: TemplatePackage = {
  schemaVersion: 1,
  id: "weekly-release",
  version: 1,
  name: "Weekly release",
  summary: "Leads with this week's menu or drop, then what's available and how to collect it.",
  bestFor: "Bakers and makers who open orders on a schedule.",
  skin: "farmhouse",
  businessModes: ["FOOD_BUSINESS", "BOTH"],
  pages: {
    home: [
      {
        slot: "hero",
        type: "hero",
        variant: "simple",
        props: {
          headline: "{{business.headline}}",
          supportingText: "{{business.subheadline}}",
          ctaLabel: "See this week",
        },
      },
      { slot: "release", type: "nextDrop", variant: "weekly-box", props: { heading: "This week's release" } },
      {
        slot: "products",
        type: "productGrid",
        variant: "availability",
        props: { heading: "Available now", limit: 8, columns: 3 },
      },
      {
        slot: "signup",
        type: "signup",
        props: {
          heading: "Get the weekly release",
          body: "We'll let you know when the next menu opens.",
          buttonLabel: "Notify me",
        },
      },
      { slot: "pickup", type: "pickup", variant: "visit-stand", props: { heading: "Collection & delivery" } },
      { slot: "reviews", type: "reviews", variant: "quote", props: { heading: "Kind words" } },
    ],
  },
};
