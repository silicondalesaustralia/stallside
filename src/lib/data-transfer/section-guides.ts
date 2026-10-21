export type SectionGuide = {
  id: "categories" | "products" | "preorders" | "subscriptions" | "customers" | "orders";
  title: string;
  summary: string;
  tips: string[];
  hasTemplate: boolean;
};

export const SECTION_GUIDES: SectionGuide[] = [
  {
    id: "categories",
    title: "Product categories",
    summary: "Your category names, descriptions and images.",
    hasTemplate: true,
    tips: ["Each category has a slug (its web address) that products refer to."],
  },
  {
    id: "products",
    title: "Products",
    summary: "Names, prices, stock, photos, categories and where each product sells.",
    hasTemplate: true,
    tips: [
      "Prices are in dollars (12.50). Yes/no columns show yes or no.",
      "Several categories are separated by |, e.g. eggs|dairy. Photos are public links.",
      "Archived products aren't included.",
    ],
  },
  {
    id: "preorders",
    title: "Pre-order pages",
    summary: "Pre-order pages with their order-by and collection dates and products.",
    hasTemplate: true,
    tips: [
      "Products are listed by slug, separated by |.",
      "Dates use your business time zone in the form 2026-11-20 17:00.",
    ],
  },
  {
    id: "subscriptions",
    title: "Subscriptions",
    summary: "Subscription boxes and memberships (subscribers aren't included).",
    hasTemplate: true,
    tips: ["Box contents are listed as product-slug:quantity separated by |."],
  },
  {
    id: "customers",
    title: "Customers",
    summary: "Your customer list with contact details, notes and marketing consent.",
    hasTemplate: true,
    tips: ["Only email people marked marketing_consent yes about promotions."],
  },
  {
    id: "orders",
    title: "Orders",
    summary: "Every order (all statuses, all time), plus a line-by-line items file with GST.",
    hasTemplate: false,
    tips: [
      "Use the Payment status column to filter out unpaid or cancelled orders.",
      "For a date range, use Export on the Orders page instead.",
    ],
  },
];
