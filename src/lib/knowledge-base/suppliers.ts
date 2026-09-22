import type { KnowledgeArticle } from "./types";

export const supplierArticles: KnowledgeArticle[] = [
  {
    slug: "suppliers",
    title: "Sell a neighbour's produce",
    summary:
      "Invite a neighbour to add stock into your products. You set what you owe them per unit, get notified when they restock, and keep a record of what you owe.",
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
      "Enter their name and email, then send the invite. They sign in with that email and land on Supply. They only see stock they can update — not your orders, customers, takings, or settings.",
      "Open their name. Under “Let them add stock to one of your products”, pick an existing product (for example your eggs), set what you owe them per unit, and choose “Add to stock straight away” if their adds should go live without you tapping Approve. Tap Link product. Shoppers still see your one listing.",
      "On Supply they see “You have approval to add these products”. They add or remove their units into that shared stock. You get an in-app alert, email, and phone push: who, which product, how many, and when.",
      "If “Add to stock straight away” is off, new adds sit under Waiting for your approval until you tap Approve into stock. Until then those units are not on the stall.",
      "When shoppers buy, the oldest contributions sell first. Units from their adds count toward what you owe them. Your own stock sold from the same product does not.",
      "Their page shows units they added, units sold from their contributions, their units still on hand, amount owed, and what you have marked paid. Refunded orders are left out.",
      "When you pay them by cash or transfer, enter the amount and tap Mark paid. Vendl does not send the money. Card takings still land in your account.",
      "Optional: they can add a separate product under “Add a separate product instead” when it should not share stock with yours. You set the retail price and publish from their page. Those appear under Products → Supplier. Hide on stand takes a separate product off the stall and website without deleting it.",
      "To stop sharing one of your products, open their page and tap Stop linking. To remove a separate supplier product, tap Delete product (it goes to Archived). They can delete their own separate products from Supply the same way.",
      "Revoke access keeps them in the list but locked out. Delete supplier removes them: separate products go to Archived, links are cleared, and their remaining shared stock is taken off the stall.",
    ],
  },
];
