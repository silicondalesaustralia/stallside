import type { FaqItem } from "@/lib/schema";
import { APP_NAME } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { CASH_PLAN_BY_CURRENCY } from "@/lib/saas-pricing";

export const LANDING_FAQS: FaqItem[] = [
  {
    question: `What is ${APP_NAME}?`,
    answer:
      "Stallside is QR self-checkout and inventory software for unmanned farm stands and honesty stalls. Customers scan a printed QR code, pick what they're taking, and pay cash or card—while you track stock and sales from your phone.",
  },
  {
    question: "How does QR checkout work?",
    answer:
      "You print a QR poster for each stand. Shoppers open it on their phone, select items, and confirm payment. Cash sales are customer-confirmed and logged; card payments use Stripe Checkout when that plan is available.",
  },
  {
    question: "Who is Stallside for?",
    answer:
      "Farm stand and honesty stall operators who need reliable checkout without staffing the stall—plus anyone selling from an unattended roadside or roadside produce set-up.",
  },
  {
    question: "How much does it cost?",
    answer: `The live Cash plan is ${formatMoney(CASH_PLAN_BY_CURRENCY.AUD, "AUD")}, ${formatMoney(CASH_PLAN_BY_CURRENCY.USD, "USD")}, ${formatMoney(CASH_PLAN_BY_CURRENCY.GBP, "GBP")}, or ${formatMoney(CASH_PLAN_BY_CURRENCY.EUR, "EUR")} per month per site—pick currency at signup. 30-day free start. Card / PayPal coming soon. No Stallside fees on customer cash payments.`,
  },
  {
    question: "Can shoppers see exact stock counts?",
    answer:
      "Public stock shows Availability bands (Available, Low stock, Sold out) by default—exact counts stay private unless you choose otherwise.",
  },
  {
    question: "How do I get started?",
    answer:
      "Sign in with a magic link, name your business, add a stand and products, then print your QR poster. Most owners are ready in a few minutes.",
  },
  {
    question: "Do I need special hardware?",
    answer:
      "No card readers or tablets are required for the Cash plan. Customers use their own phone. A printer for QR posters is enough to go live.",
  },
];
