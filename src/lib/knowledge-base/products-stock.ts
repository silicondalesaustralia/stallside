import type { KnowledgeArticle } from "./types";

export const productsStockArticles: KnowledgeArticle[] = [
  {
    slug: "manage-products",
    title: "Add and manage products",
    summary:
      "Set prices, starting stock, low-stock alerts, and which stand sells each item.",
    videoUrl: null,
    related: ["adjust-inventory", "first-stand", "alerts-push"],
    ctas: [
      { label: "Products", href: "/dashboard/products" },
      { label: "Add product", href: "/dashboard/products/new" },
    ],
    steps: [
      "Open Products to see everything you sell across stands.",
      "Tap Add product. Pick the stand, name the item (e.g. Dozen eggs), set the price in the stand’s currency, and enter starting stock.",
      "Set a low-stock threshold — when stock hits that number or below, Stallside can email and push you (with a cooldown so you are not spammed).",
      "Save. The product appears on that stand’s public checkout for customers to scan and buy.",
      "To stop selling an item, remove it from Products. History and past orders stay in Orders.",
      "Need a quick stock change without editing the product from scratch? Use Inventory (Stock) for restocks and corrections — see Adjust inventory in the field.",
    ],
  },
  {
    slug: "adjust-inventory",
    title: "Adjust inventory in the field",
    summary:
      "Restock, mark spoilage, fix counts, or log a cash sale without the QR flow.",
    videoUrl: null,
    related: ["manage-products", "sales-orders", "alerts-push"],
    ctas: [{ label: "Inventory", href: "/dashboard/inventory" }],
    steps: [
      "Open Inventory (Stock on the phone tab bar) to see products and current counts.",
      "Choose a product and pick how to adjust: Increase (restock), Decrease (spoil or take home), or Set (exact count after a stocktake).",
      "Enter the quantity and pick a reason when asked so your history stays clear.",
      "Save. The new stock count shows on the public stand according to your exact-stock vs bands setting.",
      "If someone paid cash without scanning the QR, use the cash-sale style adjustment (or complete a cash checkout on a phone at the stand) so Orders and stock stay accurate.",
      "When stock crosses your low-stock threshold, you may get an email or phone push. The same product won’t re-alert for about 6 hours.",
    ],
  },
];
