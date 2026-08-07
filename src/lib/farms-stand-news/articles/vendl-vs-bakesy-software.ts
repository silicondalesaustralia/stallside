import type { NewsComparedSoftware } from "../types";

export const vendlVsBakesySoftware: NewsComparedSoftware[] = [
  {
    id: "vendl",
    name: "Vendl",
    url: "https://vendl.app",
    applicationSubCategory: "Point of Sale and Inventory Software",
    operatingSystem:
      "Web browser (iOS, Android, desktop) — no customer app required",
    description:
      "QR self-checkout, inventory and paid pre-orders for unattended farm stands, roadside stalls, honesty boxes and collection points.",
    listLabel: "Vendl — best for unattended stands and collection points",
    featureList: [
      "QR-based unattended self-checkout",
      "Live stock tracking and low-stock alerts",
      "Cash self-confirmation",
      "PayID and PayTo (Australia)",
      "Card, Apple Pay, Google Pay and Link via Stripe",
      "Klarna and Zip pay-later on larger orders",
      "Paid pre-orders with order-by deadlines and collection days",
      "Collections workflow with Ready and Collected statuses",
      "Customer restock notifications",
      "Sale alerts by email and push",
      "Product options and variants",
      "Custom stall branding and social links",
    ],
    offers: [
      {
        name: "Vendl Free",
        price: "0",
        priceCurrency: "AUD",
        url: "https://vendl.app/#pricing",
        description:
          "All Vendl features at $0/month. A 2.5% Vendl platform fee applies to card, Tap & Go and pay-later payments; cash and PayID carry no Vendl fee. Standard Stripe processing fees apply separately.",
      },
      {
        name: "Vendl Pro",
        price: "19.99",
        priceCurrency: "AUD",
        url: "https://vendl.app/#pricing",
        unitText: "per site per month",
        description:
          "Removes the 2.5% Vendl platform fee. Standard Stripe processing fees still apply. Also billed at US$14.99, £11.99 or €14.99 per site.",
      },
    ],
  },
  {
    id: "bakesy",
    name: "Bakesy",
    url: "https://bakesy.app",
    applicationSubCategory: "Home Bakery Order Management Software",
    operatingSystem: "iOS, Android, Web",
    description:
      "All-in-one order management, hosted shop and invoicing software for home bakers and made-to-order bakery businesses.",
    listLabel: "Bakesy — best for custom home-bakery order management",
    featureList: [
      "Hosted Bakesy Shop website",
      "Custom customer order forms",
      "Branded invoices and automated receipts",
      "Unlimited incoming orders",
      "Unlimited gallery pictures",
      "Availability calendar",
      "Customer reviews",
      "Customer QR code",
      "Custom domain connection",
      "Instant Checkout (Premium)",
      "Inventory management (Premium)",
      "Revenue dashboard, reminders, calendar sync and discount codes (Premium)",
    ],
    offers: [
      {
        name: "Bakesy Standard",
        price: "9.99",
        priceCurrency: "USD",
        url: "https://www.bakesy.app/pricing",
        unitText: "per month",
        description:
          "Hosted shop, order forms, branded invoices, reviews and availability. 30-day free trial.",
      },
      {
        name: "Bakesy Premium",
        price: "17.99",
        priceCurrency: "USD",
        url: "https://www.bakesy.app/pricing",
        unitText: "per month",
        description:
          "Everything in Standard plus Instant Checkout, inventory management, revenue dashboard, reminders, calendar sync and discount codes. 30-day free trial.",
      },
    ],
  },
];
