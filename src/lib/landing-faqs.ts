import type { FaqItem } from "@/lib/schema";
import { APP_NAME } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { CARD_PLAN_BY_CURRENCY, CASH_PLAN_BY_CURRENCY } from "@/lib/saas-pricing";

export const LANDING_FAQS: FaqItem[] = [
  {
    question: "Won't customers just scan and not pay?",
    answer:
      "The same reason your honesty box already works: people who stop at an unattended stall are there to pay, not to dodge. Stallside doesn't replace that trust, it backs it up. Every sale is logged the moment it happens, you get an instant alert, and stock updates in real time, so you always know what left and what came in. If anything, a QR catches the sales a cash-only tin quietly loses: the customer who'd have driven off because they had nothing smaller than a fifty.",
  },
  {
    question: `What is ${APP_NAME}?`,
    answer:
      "Stallside is QR self-checkout and inventory for unattended stalls of any kind: produce, firewood, flowers, car parks and more. Shoppers scan a printed QR, pick what they're taking, and pay, while you track stock and sales from your phone.",
  },
  {
    question: "What's the difference between Cash and Card / PayPal?",
    answer:
      "Cash (live today): shoppers confirm they left cash in your slot or cash box, or paid you by PayID. Every sale is logged and you get alerts. No card reader for Cash. Card / Tap & Go (live): same QR flow, shoppers pay by card, Apple Pay, or Google Pay on their phone — money goes to your Stripe account. PayPal coming soon. No Stallside transaction fees on either plan.",
  },
  {
    question: "Can customers pay by bank transfer / PayID?",
    answer:
      "Yes on Australian (AUD) stands. Add your PayID in stand settings and shoppers can choose Pay with PayID at checkout. They pay in their own banking app, then tap I've paid. Stallside marks the sale and updates stock. The payment is customer-confirmed, not verified by us. Money goes straight to your account.",
  },
  {
    question: "How does QR checkout work?",
    answer:
      "You print a QR poster for each stand. Shoppers open it on their phone and select items. On Cash they confirm cash and PayID (Australia only) at the stand and you are alerted. On Card / Tap & Go they pay digitally in the same checkout (card, Apple Pay, Google Pay). Stock updates either way.",
  },
  {
    question: "How much does it cost?",
    answer: `Cash (live): ${formatMoney(CASH_PLAN_BY_CURRENCY.AUD, "AUD")}, ${formatMoney(CASH_PLAN_BY_CURRENCY.USD, "USD")}, ${formatMoney(CASH_PLAN_BY_CURRENCY.GBP, "GBP")}, or ${formatMoney(CASH_PLAN_BY_CURRENCY.EUR, "EUR")} per month per site, with a 30-day free trial. Card / Tap & Go (live): ${formatMoney(CARD_PLAN_BY_CURRENCY.AUD, "AUD")} / ${formatMoney(CARD_PLAN_BY_CURRENCY.USD, "USD")} / ${formatMoney(CARD_PLAN_BY_CURRENCY.GBP, "GBP")} / ${formatMoney(CARD_PLAN_BY_CURRENCY.EUR, "EUR")} per month per site — no free trial, billed from day one. Pick billing currency at signup or in billing settings.`,
  },
  {
    question: "Who is Stallside for?",
    answer:
      "Anyone running an unattended stall of any kind: produce, firewood, flowers, car parks and more, who needs checkout and stock tracking without staffing the stall all day.",
  },
  {
    question: "Can shoppers see exact stock counts?",
    answer:
      "Public stock shows Availability bands (Available, Low stock, Sold out) by default. Exact counts stay private unless you choose otherwise.",
  },
  {
    question: "Do I need special hardware?",
    answer:
      "A printer for your QR poster is enough. Customers use their own phones. Card / Tap & Go needs no terminal or card reader — payments happen on the shopper's phone via Stripe Checkout.",
  },
  {
    question: "What about cash going missing?",
    answer:
      "It happens: a tin by the road is easy to empty. Cash sales are still logged the moment a customer confirms, so your records stay right even if the box doesn't. With Tap & Go, that money lands straight in your Stripe account, with nothing left at the stand to take.",
  },
];
