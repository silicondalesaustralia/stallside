import type { KnowledgeArticle } from "./types";

export const customerArticles: KnowledgeArticle[] = [
  {
    slug: "customers",
    title: "Your customers",
    summary: "See everyone who's bought from you, what they spend, what they buy, and keep notes.",
    keywords: ["customer", "crm", "ltv", "notes", "contacts", "buyers"],
    related: ["customer-lists", "email-campaigns", "manage-orders"],
    ctas: [{ label: "Customers", href: "/dashboard/customers" }],
    steps: [
      "Open Customers. Anyone who left an email on an order, subscription or restock sign-up appears here, across all your businesses.",
      "Search by name, email or phone.",
      "Each customer shows their orders, lifetime value (LTV), whether they're happy to get marketing, and how they found you.",
      "Tap View for their stats, the products they've bought, their orders and subscriptions.",
      "Add Notes (for example allergies or a usual order) and tap Save notes.",
      "Tap Email this customer to write to them from Communication.",
    ],
    tips: ["Cash sales without an email stay anonymous."],
  },
  {
    slug: "customer-lists",
    title: "Build customer lists",
    summary: "Group customers by what they bought, or paste in your own contacts, ready to email.",
    keywords: ["list", "segment", "audience", "import", "csv", "upload", "contacts"],
    related: ["customers", "email-campaigns"],
    ctas: [{ label: "Customer lists", href: "/dashboard/customers/lists" }],
    steps: [
      "Open Customers → Lists.",
      "Tap From rules. Name the list, pick the products bought, and optionally a Purchased within number of days, Pre-order customers only, or Marketing consent only. Tap Create list.",
      "Rule-based lists keep updating as new orders come in.",
      "To bring in contacts from elsewhere, tap Upload CSV, name the list and paste your rows (an email per row, with optional name and phone columns).",
      "Tap Email on a list to write to it, or Archive to put it away.",
    ],
    tips: [
      "Pasted contacts aren't marked as agreeing to marketing, so Marketing consent only lists leave them out. Only email people who've agreed to hear from you.",
      "Up to 5,000 rows per paste. Duplicates and invalid emails are skipped.",
    ],
  },
];
