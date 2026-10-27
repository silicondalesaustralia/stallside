import type { KnowledgeArticle } from "./types";

export const subscriptionArticles: KnowledgeArticle[] = [
  {
    slug: "subscriptions",
    title: "Recurring box subscriptions",
    summary:
      "Sell a weekly, fortnightly or monthly box paid by card. Each paid cycle becomes an order under Pick Ups & Delivery.",
    availability: "Stripe or Square",
    keywords: ["subscription", "box", "veg box", "recurring", "weekly", "csa"],
    related: ["memberships", "square-subscriptions", "collections-day"],
    ctas: [{ label: "New subscription", href: "/dashboard/subscriptions/new" }],
    steps: [
      "Connect Stripe, or Square with subscriptions turned on (see Subscriptions and memberships on Square). Subscriptions are card only.",
      "Make sure the box's products exist in Products with the prices you want. The box price is the sum of products × quantity.",
      "Open Subscriptions, tap + New subscription and choose Recurring box.",
      "Enter a Title, Description and Cover photo. Pick the Billing interval (Weekly, Fortnightly or Monthly) and Handover (Collect or Deliver).",
      "Optionally set a Collection weekday and a Collection / delivery note.",
      "Under Products in the box, set quantities, keep Offer is live ticked, and tap Create offer.",
      "Share the offer's public link, shown on the offer page. To list all your offers in your shop menu, tick Show Memberships on the stand page on the Subscriptions page.",
    ],
    tips: [
      "Each paid cycle creates an order, takes the products out of stock and emails you and the shopper.",
      "Shoppers can skip the next cycle, pause, resume, or update their card and cancel from their manage link. On Stripe, a skipped cycle is still charged but no order is made; on Square it isn't charged.",
      "Changing products or prices only affects new sign-ups. Existing subscribers keep the price they signed up at.",
      "If an offer says the Stripe price isn't synced, open it and save again once Stripe is connected.",
      "You can't delete an offer with active or paused subscribers. Turn it off instead to stop new sign-ups.",
    ],
  },
  {
    slug: "memberships",
    title: "Memberships",
    summary:
      "Sell a fixed-term membership with your own prices. Members pay weekly, monthly or upfront and collect every week.",
    availability: "Stripe or Square",
    keywords: ["membership", "member", "csa", "season", "term", "pay in full"],
    related: ["subscriptions", "square-subscriptions", "collections-day"],
    ctas: [{ label: "New subscription", href: "/dashboard/subscriptions/new" }],
    steps: [
      "Open Subscriptions, tap + New subscription and choose Membership.",
      "Enter a Title, Intro copy and Cover photo.",
      "Set the Term (weeks), for example 26, and optionally Max members.",
      "Choose Handover, the Collection weekday and a Collection note.",
      "Under Payment plans, tick Weekly, Monthly and/or Pay in full and type a price for each.",
      "Add Pay-in-full benefits (one per line) and FAQ / details (separate questions with a blank line).",
      "Tap Create offer and share the link.",
    ],
    tips: [
      "Members collect weekly whichever plan they pay on. Each week's collection appears in Pick Ups & Delivery.",
      "Weekly and monthly plans stop billing automatically at the end of the term.",
      "Pay-in-full members can't cancel online; they contact you.",
      "When Max members is reached, new sign-ups are blocked.",
    ],
  },
];
