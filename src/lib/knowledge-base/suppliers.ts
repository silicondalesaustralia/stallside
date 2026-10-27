import type { KnowledgeArticle } from "./types";

export const supplierArticles: KnowledgeArticle[] = [
  {
    slug: "suppliers",
    title: "Sell a neighbour's produce",
    summary:
      "Invite a neighbour to add stock to your products. You set what you owe them per unit, see when they restock, and keep track of what you owe.",
    keywords: ["supplier", "neighbour", "consignment", "invite", "owe", "mark paid"],
    related: ["supplier-payments", "notifications-inbox", "inventory-report"],
    ctas: [{ label: "Suppliers", href: "/dashboard/suppliers" }],
    steps: [
      "Open Suppliers in the sidebar (More → Suppliers on your phone). Suppliers belong to the business you have selected.",
      "Under Invite a supplier, enter their Name and Email and tap Send invite. They get an email with an Accept invite link and sign in with that email.",
      "Open their name. Under Let them add stock to one of your products, pick a product, set what you owe them per unit, and tap Link product. Shoppers still see your one listing.",
      "Add to stock straight away is ticked by default. Untick it if you'd rather approve each delivery.",
      "On their Supply page they see Your stock and can add or remove units. You get a notification with who, what and how many.",
      "If approval is on, new units wait under Waiting for your approval until you tap Approve into stock.",
      "You can add their stock yourself with Add {name}'s inventory on their page.",
      "Suppliers can also add their own products under Add a product (Name, Description, Starting stock and Photo). These show as Not on the stall yet on their page until you set a Retail price and what You owe per unit, then tap Publish.",
    ],
    tips: [
      "Supplier units sell first, oldest first. Only units they added count toward what you owe them.",
      "Products shows the split when supplier units are on hand, for example 8 yours · 4 supplier.",
      "Suppliers only see stock they can update, not your orders, customers or takings.",
    ],
  },
  {
    slug: "supplier-payments",
    title: "Pay suppliers and end access",
    summary: "Track what you owe, record payments, and stop sharing products or remove a supplier.",
    keywords: ["owed", "pay supplier", "revoke", "remove", "stop linking"],
    related: ["suppliers"],
    ctas: [{ label: "Suppliers", href: "/dashboard/suppliers" }],
    steps: [
      "Open Suppliers and tap their name. You'll see Added, Sold, Their stock on hand, Owed, Marked paid and Balance.",
      "When you pay them by cash or transfer, enter the Amount (and an optional Note) and tap Mark paid. Vendl records it but doesn't move money.",
      "To stop sharing one product, tap Stop linking. Their units already in stock stay in stock.",
      "Revoke access keeps them in your list but locks them out. Invite the same email again to restore access.",
      "Delete supplier removes them, clears their links and takes their remaining stock off your stall.",
    ],
    tips: ["Refunded orders don't count toward what you owe."],
  },
];
