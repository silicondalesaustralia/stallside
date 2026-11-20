import type { FeatureMenuColumn } from "@/lib/features/types";

/** Mega-menu columns. Slugs must exist in the feature registry. */
export const FEATURE_MENU_COLUMNS: FeatureMenuColumn[] = [
  {
    heading: "Sell",
    items: [
      { slug: "online-shop", label: "Online shop" },
      { slug: "pre-orders", label: "Pre-orders" },
      { slug: "subscriptions", label: "Subscriptions & memberships" },
      { slug: "stall-checkout", label: "Stall & QR checkout" },
      { slug: "bundles", label: "Bundles & volume pricing" },
    ],
  },
  {
    heading: "Get paid",
    items: [{ slug: "payments", label: "Payments & fees" }],
  },
  {
    heading: "Run the business",
    items: [
      { slug: "inventory", label: "Inventory & stock" },
      { slug: "orders", label: "Orders" },
      { slug: "suppliers", label: "Suppliers" },
      { slug: "calendar", label: "Calendar" },
    ],
  },
  {
    heading: "Grow",
    items: [
      { slug: "customers", label: "Customers & lists" },
      { slug: "email-marketing", label: "Email marketing" },
      { slug: "social", label: "Social posts & video" },
      { slug: "restock-alerts", label: "Restock alerts" },
    ],
  },
  {
    heading: "Make & cost",
    items: [{ slug: "costing", label: "Recipes & costing" }],
  },
  {
    heading: "Your site",
    items: [{ slug: "website", label: "Web Studio" }],
  },
];
