import type { KnowledgeArticle } from "./types";

export const supplierArticles: KnowledgeArticle[] = [
  {
    slug: "suppliers",
    title: "Sell a neighbour's produce",
    summary:
      "Invite someone to add stock into your products. You set what you owe them per unit, hear when they restock, and keep a record of what you owe.",
    videoUrl: null,
    omitVideo: true,
    related: ["first-stand", "alerts-push"],
    ctas: [
      { label: "Suppliers", href: "/dashboard/suppliers" },
      { label: "Supplier", href: "/dashboard/products?tab=supplier" },
      { label: "Alert settings", href: "/dashboard/settings" },
    ],
    steps: [
      "Open More tools → Suppliers on the stand you have selected.",
      "Enter their name and email, then send the invite. They sign in with that email. They only see stock they can update on that stand — not your orders, customers, takings, or settings.",
      "Open their name. Under “Let them add stock to one of your products”, pick an existing product (for example your eggs), set what you owe them per unit, and choose whether their adds go live straight away or wait for your approve. Tap Link product.",
      "They open Supply and add or remove units on that product. Stock on the stall is shared. You get an in-app alert, email, and phone push: who, which product, how many, and when.",
      "If auto-add is off, their contribution sits under Waiting for your approval until you tap Approve into stock.",
      "When shoppers buy, the oldest contributions sell first. Units from their lots count toward what you owe them. Your own stock sold from the same product does not.",
      "Their page shows units they added, units sold from their lots, their units still on hand, amount owed, and what you have marked paid. Refunded orders are left out.",
      "When you pay them by cash or transfer, enter the amount and tap Mark paid. Vendl does not send the money. Card takings still land in your account.",
      "They can still add a separate product if it should not share stock with yours. Publish that from their page with a retail price first.",
      "If a product is synced from Square, only you can change its stock.",
      "Revoke access when they should stop updating stock. Linked products and their contribution history stay.",
    ],
  },
];
