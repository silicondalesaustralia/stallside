import type { FaqItem } from "@/lib/schema";
import { APP_NAME } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { CARD_PLAN_BY_CURRENCY } from "@/lib/saas-pricing";

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
    question: "What's the difference between Free and Pro?",
    answer:
      "Free is $0/mo with every feature: cash, PayID (Australia), Tap & Go, pre-orders, collections, branding, restock notify, and more. Card, Tap & Go, and pay-later carry a Stallside fee of 2.5% + 30¢ on all transactions; cash and PayID stay free. On Free you choose whether to absorb that fee or pass it on to customers at checkout (Settings → Card / Tap & Go). Pro is a flat monthly fee with no Stallside card fee - you keep 100% of your sales.",
  },
  {
    question: "What payment methods can customers use?",
    answer:
      "Cash and PayID (free, no fee), plus card, Tap & Go, Apple Pay and Google Pay. On larger orders, customers can also use Buy Now, Pay Later with Afterpay, Zip or Klarna. On Free, Stallside fee is 2.5% + 30¢ on card, Tap & Go, and pay-later on all transactions (absorb or pass on); removed on Pro. Cash and PayID are always free.",
  },
  {
    question: "Is there a fee on card payments?",
    answer:
      "On Free, Stallside charges 2.5% + 30¢ on card, Tap & Go (Apple Pay / Google Pay), and pay-later on all transactions. Cash and PayID have no Stallside fee. You can absorb the Stallside fee or pass it on to customers (shown as a card fee line at checkout) in Settings → Card / Tap & Go. On Pro there is no Stallside cut - keep 100% of your sales. Stripe's own processing fees still apply either way (pay-later providers usually charge more than cards).",
  },
  {
    question: "Can customers pay by bank transfer / PayID?",
    answer:
      "Yes on Australian (AUD) stands. Add your PayID in stand settings and shoppers can choose Pay with PayID at checkout. They pay in their own banking app, then tap I've paid. Stallside marks the sale and updates stock. The payment is customer-confirmed, not verified by us. Money goes straight to your account.",
  },
  {
    question: "How does QR checkout work?",
    answer:
      "You print a QR poster for each stand. Shoppers open it on their phone and select items. When paying cash they confirm cash and PayID (Australia only) at the stand and you are alerted. When paying digitally they use the same Stripe checkout (card, Apple Pay, Google Pay, and on larger orders Afterpay, Zip or Klarna). Stock updates either way.",
  },
  {
    question: "How do pre-orders work?",
    answer:
      "Mark a product as a pre-order with an order-by deadline and collection day. Customers scan your QR, choose what they want, and pay by card to reserve - money goes to your Stripe account at checkout. They get a confirmation email; you see their name and email on the order. In Collections you track who's coming by day and mark Ready, then Collected. You can show exact slots left on the stall, and message buyers from Stallside if plans change. Take-now and pre-order items need separate checkouts.",
  },
  {
    question: "How much does it cost?",
    answer: `Free is $0/mo with all features; Stallside fee is 2.5% + 30¢ on card, Tap & Go, and pay-later on all transactions (cash and PayID stay free) - absorb it or pass it on in Settings → Card / Tap & Go. Stallside Pro is ${formatMoney(CARD_PLAN_BY_CURRENCY.AUD, "AUD")} / ${formatMoney(CARD_PLAN_BY_CURRENCY.USD, "USD")} / ${formatMoney(CARD_PLAN_BY_CURRENCY.GBP, "GBP")} / ${formatMoney(CARD_PLAN_BY_CURRENCY.EUR, "EUR")} per month per site and removes the Stallside card fee. Pick billing currency at signup or in billing settings.`,
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
      "A printer for your QR poster is enough. Customers use their own phones. Paying by card / Tap & Go needs no terminal or card reader - payments happen on the shopper's phone via Stripe Checkout.",
  },
  {
    question: "What about cash going missing?",
    answer:
      "It happens: a tin by the road is easy to empty. Cash sales are still logged the moment a customer confirms, so your records stay right even if the box doesn't. With Tap & Go, that money lands straight in your Stripe account, with nothing left at the stand to take.",
  },
];
