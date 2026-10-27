import type { KnowledgeArticle } from "./types";

export const alertArticles: KnowledgeArticle[] = [
  {
    slug: "alerts-push",
    title: "Phone and email alerts",
    summary:
      "Get sale, low-stock and sold-out alerts by email and as phone notifications.",
    keywords: ["push", "notification", "alert", "email", "sale alert", "low stock", "iphone", "alert settings", "turn off"],
    related: ["sign-in-phone", "notifications-inbox", "inventory-report"],
    ctas: [{ label: "Notifications", href: "/dashboard/notifications" }],
    steps: [
      "Email alerts are on from the start. Every sale, low-stock and sold-out alert goes to your contact email.",
      "For phone notifications on iPhone, first add Vendl to your Home Screen and open it from that icon (see Sign in and add Vendl to your phone).",
      "Open Vendl on your phone. When the Enable phone alerts banner appears, tap it and choose Allow.",
      "You get Sale (or Pre-order) alerts when a customer pays, and Low stock or Sold out alerts when a product hits its threshold or zero.",
      "Repeat on each phone that should get alerts.",
      "To change them, open Notifications and expand Alert settings. Turn Email alerts or Phone push alerts on or off, add extra Alert emails, and tap Save alert settings.",
    ],
    tips: [
      "Settings → Notifications → Alert settings takes you to the same card.",
      "Low-stock alerts have a 6-hour cooldown per product, so you won't be flooded.",
      "If you blocked notifications, turn them back on in your phone settings (on iPhone: Settings → Vendl → Notifications → Allow), then tap Enable again.",
      "To stop phone alerts on a device, turn off notifications for Vendl in that phone's settings.",
      "Set each product's Low-stock threshold on the product page.",
    ],
  },
  {
    slug: "notifications-inbox",
    title: "Notifications inbox",
    summary:
      "A to-do list of stock warnings, supplier restocks and customer requests you can action or close.",
    keywords: ["inbox", "alerts", "notifications", "actioned", "badge"],
    related: ["alerts-push", "suppliers", "inventory-report"],
    ctas: [{ label: "Notifications", href: "/dashboard/notifications" }],
    steps: [
      "Open Notifications in the sidebar (Alerts on your phone). The badge shows how many are open.",
      "You'll see low stock, sold out, supplier stock changes, and customers asking for pre-orders or subscriptions.",
      "Each card shows the business, the message, and a contact or setup link when there is one.",
      "Tap Actioned when you've dealt with it, or Closed to dismiss it. Reopen brings it back.",
      "Tap Mark all closed to clear the list, or Delete to remove a single item.",
    ],
    tips: ["Sales aren't listed here. They arrive by email and phone alert, and in Orders."],
  },
];
