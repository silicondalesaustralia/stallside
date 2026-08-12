import type { ProductLpContent } from "./types";
import { PRE_ORDER_DOORWAYS } from "./pre-orders";

const bakers = PRE_ORDER_DOORWAYS.bakers;

/** UK ads LP: bakers page with GBP demo prices (AUD × 0.52, rounded). */
export const BAKERS_UK_LP: ProductLpContent = {
  ...bakers,
  metaTitle: "Pre-order system for UK bakers - no website needed",
  metaDescription:
    "Take orders for bread and any baked good in a minute. Know what to bake before you bake it. Make list and packing list included.",
  canonical: "/lp/pre-orders/bakers-uk",
  signupHref:
    "/signup?vertical=bakers&utm_content=pre-orders-bakers-uk",
  paymentMarket: "uk",
  heroPrices: {
    taken: "£320 taken",
    compareAt: "£8.00",
    price: "£6.00",
  },
  proofStats: [
    { label: "Sourdough", value: "40" },
    { label: "Cookies", value: "24" },
    { label: "Focaccia", value: "8" },
    { label: "Taken", value: "£320" },
  ],
  testimonialExtra: "",
  testimonialPlace: "United Kingdom",
  pricingHeadline: "£0 per month, with every Vendl feature.",
  closingNote: "£0 monthly on Free · No website",
};
