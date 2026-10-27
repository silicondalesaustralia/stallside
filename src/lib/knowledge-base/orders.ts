import type { KnowledgeArticle } from "./types";

export const orderArticles: KnowledgeArticle[] = [
  {
    slug: "manage-orders",
    title: "View and manage orders",
    summary: "See every sale, open an order, mark cash and PayID paid, refund card payments, ship orders and delete test orders.",
    keywords: ["orders", "sales", "delete", "refund", "abandoned", "not paid", "history", "mark paid", "order detail", "tracking", "shipped"],
    related: ["export-orders", "email-customers", "customers"],
    ctas: [{ label: "Orders", href: "/dashboard/orders" }],
    steps: [
      "Open Orders. It shows the business you have selected.",
      "Pick a range: Today through 12 months, All time, or Custom.",
      "The tiles show Orders, Items ordered, Sales, Average order and Refunds, compared with the period before.",
      "Each row shows the order number, date, customer, channel, total, payment status, fulfilment status, items and delivery method.",
      "Tap an order to open it. You'll see the items, payment breakdown, timeline, customer and pickup or delivery details. Use the arrows to step through orders.",
      "For cash and PayID, the shopper confirms they paid at checkout. Once the money is in your tin or bank, open the order and tap Mark paid.",
      "To refund a Stripe or Square payment, open the order and tap Refund. Enter the amount, choose whether to return items to stock, and confirm. The money goes back to the shopper's card.",
      "For PayPal, tap Refund in PayPal and refund it there, then tap Check refund status so Vendl updates the order.",
      "For delivery orders, tap Add tracking & mark shipped, pick the carrier, add the tracking number and tap Save & email customer. When it arrives, tap Mark delivered & email customer.",
      "To remove a test or abandoned order, tap Delete. Stock from a paid sale is put back.",
    ],
    tips: [
      "Card refunds can't be undone. Partial refunds show as Partially refunded on the order.",
      "Cash and PayID refunds happen outside Vendl: hand the money back, then delete the order if you want it out of your figures.",
      "Deleting an order doesn't put stock back in Square.",
      "Up to 100 orders show per range. Use Export to get everything.",
    ],
  },
  {
    slug: "email-customers",
    title: "Email a customer about their order",
    summary: "Message one buyer, or everyone on a pre-order page, about pickup times, delays and so on.",
    keywords: ["email", "message", "contact", "pickup", "running late", "email all"],
    related: ["collections-day", "email-campaigns", "manage-orders"],
    ctas: [
      { label: "Pick Ups & Delivery", href: "/dashboard/collections" },
      { label: "Orders", href: "/dashboard/orders" },
    ],
    steps: [
      "Open the order and tap the customer's email. On Pick Ups & Delivery, tap the email on the order.",
      "Edit the Subject and write your Message, then tap Send email.",
      "To message everyone on a pre-order page, open its card in Pick Ups & Delivery and tap Email all (N).",
      "Emails come from Vendl on your behalf. Replies go to your email.",
    ],
    tips: [
      "Order emails only work for fully paid card orders. Cash, PayID and deposit orders that haven't been fully paid are skipped.",
      "Email all sends to up to 200 orders.",
      "For marketing messages, use Communication instead.",
    ],
  },
];
