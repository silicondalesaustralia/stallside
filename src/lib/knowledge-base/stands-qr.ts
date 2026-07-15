import type { KnowledgeArticle } from "./types";

export const standsQrArticles: KnowledgeArticle[] = [
  {
    slug: "manage-stands",
    title: "Manage stands",
    summary:
      "Create and edit stands, set currency, go live or disable, and control how stock appears to customers.",
    videoUrl: null,
    related: ["first-stand", "print-qr", "manage-products"],
    ctas: [
      { label: "My stands", href: "/dashboard/stands" },
      { label: "New stand", href: "/dashboard/stands/new" },
    ],
    steps: [
      "Open My stands to see every stand, whether it is live, and shortcuts to QR and manage.",
      "Tap New stand to add another location (gate, honesty box, second road stand, etc.). Each stand has its own currency and checkout link.",
      "On a stand’s manage page, edit name, location label, customer instructions, and whether the stand is live.",
      "Live stands accept checkouts. Disabled stands keep history and products but hide the public QR checkout for new sales.",
      "Choose whether customers see exact stock numbers or softer bands (Available / Low stock / Sold out). Change this anytime on the stand.",
      "Your public link looks like stallside.app/s/your-slug. Keep the slug clear — it is what people type or scan.",
      "Delete a stand only when you are sure. Prefer Disable if you might reopen that location later.",
    ],
  },
  {
    slug: "print-qr",
    title: "Print and use your QR sign",
    summary:
      "Generate print-ready QR signs, edit sign copy, and use the live stallside.app link.",
    videoUrl: null,
    related: ["manage-stands", "first-stand"],
    ctas: [{ label: "My stands", href: "/dashboard/stands" }],
    steps: [
      "From My stands or a stand’s manage page, open QR & print.",
      "Choose a size (full A4, half, or quarter). Use larger sizes outdoors and smaller for fridge doors or baskets.",
      "Edit sign copy if offered — headline, short message, and instructions that print with the QR.",
      "Use Print for a paper sign, or download/share the image. Copy the checkout link if you also want to text it.",
      "Always print with your live URL (stallside.app). If the page warns about a local or preview URL, fix the public app URL before laminating signs.",
      "Customers who scan go to the public checkout for that stand only — they pick products and pay cash or card when you have card payments enabled.",
      "After reprinting, toss old signs so people do not scan an outdated stand or URL.",
    ],
  },
];
