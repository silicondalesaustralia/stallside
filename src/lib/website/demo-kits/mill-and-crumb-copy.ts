import type { DemoKitCopy } from "./types";

export const MILL_AND_CRUMB_COPY: DemoKitCopy = {
  headline: {
    short: "Baked for the week",
    medium: "Preorder breads, pastries and cakes",
    long: "A small bakery range — order ahead, collect on bake day",
  },
  subhead: "Weekly preorder menu with timed pickup windows.",
  announcement: "Friday bake list is live — order by Thursday 5pm",
  promo: "Weekend pastry box — limited slots",
  processSteps: ["Mix and ferment overnight", "Bake early Friday", "Ready at your pickup window"],
  faq: [
    { q: "When do I order?", a: "Menu opens Monday; cut-off is Thursday evening." },
    { q: "Can I change my order?", a: "Yes, until the Thursday cut-off." },
    { q: "Do you deliver?", a: "Pickup only for now — windows shown at checkout." },
    { q: "Any allergens?", a: "Each product lists allergens on its page." },
    { q: "Subscriptions?", a: "Bread subscription delivers the same loaf each bake week." },
    { q: "Custom cakes?", a: "Message us for celebration cakes with 5 days’ notice." },
  ],
  reviews: [
    { text: "The croissant is worth setting an alarm for.", name: "Jordan L." },
    { text: "Preorder is simple and everything arrives still warm.", name: "Nina P." },
    { text: "Olive oil cake is our go-to gift.", name: "Chris T." },
  ],
  cta: { primary: "View this week’s menu", secondary: "Pickup info" },
  about: {
    heading: "About {businessName}",
    short:
      "{businessName} is a neighbourhood bakery baking a short weekly menu — breads, pastries and a few cakes, made to order.",
    long:
      "{businessName} bakes for people who like to plan ahead. We publish a weekly menu, ferment overnight, and bake early so your pickup window is calm and on time. The range stays small on purpose: better dough, clearer flavours, less waste.",
    pillars: [
      "A short weekly bake list",
      "Timed pickup, no queue chaos",
      "Bread subscriptions when you want the habit",
    ],
  },
};
