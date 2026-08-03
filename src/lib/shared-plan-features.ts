import type { BillingCurrency } from "@/lib/saas-pricing";
import {
  humanizePmcMethod,
  regionalPmcMethodList,
} from "@/lib/stripe-pmc-labels";

const BEFORE = [
  "Unlimited products and product options / variants",
  "Real stock counts and printable QR posters",
] as const;

const AFTER = [
  "Sale alerts, low-stock alerts, email and push notifications",
  "Orders and inventory dashboard",
  "Card-demand counter",
  "Customer restock notifications",
  "Pre-orders with order-by deadlines and collection days",
  "Collections - Ready and Collected, buyer messaging",
  "Stall branding - logo, colours, social and website links",
] as const;

const PMC_FEATURE_LABEL: Record<string, string> = {
  card: "Card / Tap & Go payments",
  apple_pay: "Apple Pay",
  google_pay: "Google Pay",
  link: "Link by Stripe",
  cashapp: "Cash App",
  payto: "PayTo",
  klarna: "Klarna",
  zip: "Zip",
  affirm: "Affirm",
  ideal: "iDEAL",
  bancontact: "Bancontact",
  sepa_debit: "SEPA Direct Debit",
};

/** Region payment bullets for the shared Free/Pro feature list. */
export function sharedPaymentFeatures(currency: BillingCurrency): string[] {
  const features = ["Cash self-confirmation"];
  if (currency === "AUD") features.push("PayID bank transfer");
  for (const method of regionalPmcMethodList(currency)) {
    features.push(PMC_FEATURE_LABEL[method] ?? humanizePmcMethod(method));
  }
  return features;
}

/** Shared Free/Pro features - payment lines follow selected region. */
export function sharedPlanFeatures(currency: BillingCurrency): string[] {
  return [...BEFORE, ...sharedPaymentFeatures(currency), ...AFTER];
}
