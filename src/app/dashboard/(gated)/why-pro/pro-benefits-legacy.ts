import { proBenefitGroups, type ProBenefit } from "./pro-benefits";

/** The original Pro groupings, still used by the public home page and landing-page plan lists. */
const LEGACY_GROUPS: { heading: string; titles: string[] }[] = [
  { heading: "Keep more of every sale", titles: ["No Vendl fee on card sales", "PayPal checkout"] },
  {
    heading: "Your own website",
    titles: ["Web Studio, pages & blog", "Your own web address", "Tags & Pixels", "Reviews", "URL redirects"],
  },
  { heading: "Sell more", titles: ["Email marketing", "Discount codes", "Cart upsell rules", "Shipping rates"] },
  {
    heading: "Run your kitchen",
    titles: ["Batches & materials", "Recipes, costing & pricing", "AI invoice scanning", "Profit & loss"],
  },
  { heading: "Stay organised", titles: ["The Vendl app", "Calendar", "More QR codes", "Data import"] },
  {
    heading: "Social & referrals",
    titles: ["Social credits every month", "AI video clips", "Video editor", "Earn from referrals"],
  },
];

const ALL: ProBenefit[] = proBenefitGroups(true).flatMap((group) => group.items);

export const PRO_BENEFIT_GROUPS: { heading: string; items: ProBenefit[] }[] = LEGACY_GROUPS.map(({ heading, titles }) => ({
  heading,
  items: titles.flatMap((title) => ALL.filter((b) => b.title === title)),
}));
