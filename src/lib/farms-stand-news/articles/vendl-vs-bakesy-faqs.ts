import type { FaqItem } from "@/lib/schema";

export const vendlVsBakesyFaqs: FaqItem[] = [
  {
    question: "Is Vendl or Bakesy better for a farm stand?",
    answer:
      "Vendl is the stronger fit for a farm stand. It is built for unattended selling: the customer scans a printed QR code, sees what is available, picks what they are taking and pays on their own phone, with no app, account or card terminal involved. Stock counts drop after each sale and the owner gets an instant alert. Bakesy is built around bakery order requests, invoices and production scheduling, which is a different workflow from take-now stand sales.",
  },
  {
    question: "Does Vendl include inventory management on the free plan?",
    answer:
      "Yes. Vendl Free and Vendl Pro include the same feature set, including live stock counts, low-stock alerts, product variants, pre-orders and collection management. The only difference between the plans is the 2.5% Vendl platform fee on card, Tap and Go and pay-later payments, which Pro removes. With Bakesy, inventory management is only available on the Premium plan.",
  },
  {
    question: "How much do Vendl and Bakesy cost?",
    answer:
      "Vendl Free is $0 per month with a 2.5% Vendl platform fee on card, Tap and Go and pay-later payments; cash and PayID carry no Vendl fee. Vendl Pro is A$19.99 per month per site (also US$14.99, £11.99 or €14.99) and removes that platform fee. Bakesy has no permanent free plan: after a 30-day free trial, Standard is US$9.99 per month and Premium is US$17.99 per month. Standard Stripe or other payment-processing fees apply separately on both platforms.",
  },
  {
    question: "Can Vendl handle paid pre-orders for collection?",
    answer:
      "Yes. You can mark a product as a pre-order with an order-by deadline and a collection day. Customers pay by card to reserve, and the money goes to your connected Stripe account at checkout. You get their name and email on the order, track who is coming in the Collections view, mark orders Ready then Collected, and message buyers if plans change. Note that take-now items and pre-order items require separate checkout flows.",
  },
  {
    question: "Do customers need to download an app to buy from a Vendl stand?",
    answer:
      "No. Customers scan the QR poster with their normal phone camera and complete checkout in the browser. No app install and no account are required. Bakesy shoppers also do not need an app to place an order through a Bakesy Shop, though the owner-side Bakesy tools are app-based.",
  },
  {
    question: "Should a home baker use Vendl or Bakesy?",
    answer:
      "It depends on how the baking is sold rather than what is baked. If customers describe a custom cake, supply event details and wait for an invoice, Bakesy is the better fit because it is built around order forms, invoicing and availability calendars. If the baker sells fixed-price loaves, cookies, pastries or boxes from an unattended table or a collection point, Vendl is usually the better fit because it supports self-checkout, live stock and paid pre-orders in one flow.",
  },
  {
    question: "What payment methods does Vendl support?",
    answer:
      "Cash with customer self-confirmation, PayID bank transfer in Australia, card, Tap and Go, Apple Pay, Google Pay and Link through Stripe, PayTo in Australia, Cash App in the United States, and Zip or Klarna pay-later on larger orders. Cash and PayID have no Vendl platform fee on either plan.",
  },
];
