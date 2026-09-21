import type { KnowledgeArticle } from "./types";

export const supplierArticles: KnowledgeArticle[] = [
  {
    slug: "suppliers",
    title: "Sell a neighbour's produce",
    summary:
      "Invite someone to add their own products and stock. You set the price, hear when they restock, and keep a record of what you owe them.",
    videoUrl: null,
    omitVideo: true,
    related: ["first-stand", "alerts-push"],
    ctas: [
      { label: "Suppliers", href: "/dashboard/suppliers" },
      { label: "Supplier", href: "/dashboard/products?tab=supplier" },
      { label: "Alert settings", href: "/dashboard/settings" },
    ],
    steps: [
      "Open More → Suppliers on the stand you have selected.",
      "Enter their name and email, then send the invite. They sign in with that email. They only see their products on that stand — not your other products, orders, customers, takings, or settings.",
      "They add a product with a name, description, photo, and starting stock. It stays off the stall and your website until you publish it.",
      "Open their name under Suppliers. Set the retail price and the amount you owe them per unit sold, then tap Publish. That puts it on the stall and the website. Shoppers pay your price. The owed amount is what you pay them, not the retail price.",
      "To take a live product off the stall and website without deleting it, open Products → Supplier and tap Hide on stand. It stays in that list so you can tap Show on stand. It does not show under Standard or Pre Order. Products you have not published yet are under Archived on that tab.",
      "When they add or remove stock, you get an in-app alert, email, and phone push: who, which product, how many, and when. They do not get your sale alerts.",
      "Their page shows units they added, units sold, stock on hand, amount owed, and what you have marked paid. Owed is units sold on paid orders times the amount you set. Refunded orders are left out.",
      "When you pay them by cash or transfer, enter the amount and tap Mark paid. Vendl does not send the money. Card takings still land in your account.",
      "Their goods are a separate product, not extra stock on one of yours. A shared product cannot be split between you after a sale.",
      "Revoke access when they should stop updating stock. Their products stay on the stand.",
    ],
  },
];
