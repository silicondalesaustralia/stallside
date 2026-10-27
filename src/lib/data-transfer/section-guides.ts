export type SectionGuide = {
  id: "categories" | "products" | "preorders" | "subscriptions" | "customers" | "orders";
  title: string;
  summary: string;
  tips: string[];
  importable: boolean;
};

export const SECTION_GUIDES: SectionGuide[] = [
  {
    id: "categories",
    title: "Product categories",
    summary: "Your category names, descriptions and images.",
    importable: true,
    tips: [
      "Rows are matched by slug: an existing slug is updated, a new one is created.",
      "Import categories before products so products can link to them.",
    ],
  },
  {
    id: "products",
    title: "Products",
    summary: "Names, prices, stock, photos, categories and where each product sells.",
    importable: true,
    tips: [
      "Rows are matched by slug. Leave a cell blank to keep what's already saved.",
      "Prices are in dollars (12.50). Yes/no columns accept yes or no.",
      "image_url must be a public https link. Photos are copied into your Vendl storage.",
      "Separate several gallery photos or categories with |, e.g. eggs|dairy.",
      "Changing stock_quantity records a stock adjustment in your inventory history.",
    ],
  },
  {
    id: "preorders",
    title: "Pre-order pages",
    summary: "Pre-order pages with their order-by and collection dates and products.",
    importable: true,
    tips: [
      "Import products first; list them by slug separated by |.",
      "Dates use your business time zone in the form 2026-11-20 17:00.",
      "payment_timing is PAY_UPFRONT, DEPOSIT_THEN_BALANCE or PAY_AT_PICKUP. Deposits need deposit_percent (1-99). PAY_AT_PICKUP needs handover COLLECT.",
    ],
  },
  {
    id: "subscriptions",
    title: "Subscriptions",
    summary: "Subscription boxes and memberships (subscribers aren't included).",
    importable: true,
    tips: [
      "kind is BOX or MEMBERSHIP. Boxes list products as slug:quantity separated by |.",
      "A box price is the total of its products. Memberships need term_weeks and at least one price.",
      "With Stripe connected, prices are set up in Stripe automatically.",
    ],
  },
  {
    id: "customers",
    title: "Customers",
    summary: "Your customer list with contact details, notes and marketing consent.",
    importable: true,
    tips: [
      "Rows are matched by email, or by phone when there's no email.",
      "Only set marketing_consent to yes for people who agreed to hear from you.",
    ],
  },
  {
    id: "orders",
    title: "Orders",
    summary: "Every order (all statuses, all time), plus a line-by-line items file.",
    importable: false,
    tips: [
      "Export only: orders can't be imported because they're tied to real payments.",
      "Open the files in Excel, Numbers or Google Sheets, or send them to your accountant.",
    ],
  },
];
