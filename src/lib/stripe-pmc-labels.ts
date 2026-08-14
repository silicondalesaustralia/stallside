import type { PaymentBrand } from "@/lib/payment-brand-assets";

/** Stripe PMC keys we show with a known brand mark. */
export const BRAND_BY_PMC_METHOD: Record<string, PaymentBrand> = {
  card: "card",
  apple_pay: "apple",
  google_pay: "google",
  link: "link",
  cashapp: "cashapp",
  paypal: "paypal",
  payto: "payto",
  klarna: "klarna",
  zip: "zip",
};

export const LABEL_BY_PMC_METHOD: Record<string, string> = {
  card: "Cards",
  apple_pay: "Apple Pay",
  google_pay: "Google Pay",
  link: "Link",
  cashapp: "Cash App Pay",
  paypal: "PayPal",
  payto: "PayTo",
  klarna: "Klarna",
  zip: "Zip",
  affirm: "Affirm",
  amazon_pay: "Amazon Pay",
  au_becs_debit: "BECS Direct Debit",
  bancontact: "Bancontact",
  blik: "BLIK",
  eps: "EPS",
  ideal: "iDEAL",
  p24: "Przelewy24",
  sepa_debit: "SEPA Direct Debit",
  us_bank_account: "US bank account",
  wechat_pay: "WeChat Pay",
  alipay: "Alipay",
  pix: "Pix",
  revolut_pay: "Revolut Pay",
  pay_by_bank: "Pay by Bank",
};

export const PMC_METHOD_SORT_ORDER = [
  "card",
  "apple_pay",
  "google_pay",
  "link",
  "cashapp",
  "payto",
  "klarna",
  "zip",
  "affirm",
  "paypal",
];

/** Never surface these in Vendl toggles or marketing. */
export const BLOCKED_PMC_METHODS: ReadonlySet<string> = new Set([
  "afterpay_clearpay",
]);

/**
 * Vendl-relevant Stripe Checkout methods by billing currency.
 * Stripe PMC objects include every global method; we only surface these.
 */
const REGION_PMC_METHODS: Record<string, readonly string[]> = {
  AUD: [
    "card",
    "apple_pay",
    "google_pay",
    "link",
    "payto",
    "klarna",
    "zip",
  ],
  USD: [
    "card",
    "apple_pay",
    "google_pay",
    "link",
    "cashapp",
    "klarna",
    "zip",
    "affirm",
  ],
  GBP: ["card", "apple_pay", "google_pay", "link", "klarna", "pay_by_bank"],
  EUR: [
    "card",
    "apple_pay",
    "google_pay",
    "link",
    "klarna",
    "ideal",
    "bancontact",
    "sepa_debit",
    "pay_by_bank",
  ],
};

const FALLBACK_PMC_METHODS = REGION_PMC_METHODS.USD;

export function regionalPmcMethodList(currency: string): readonly string[] {
  const code = currency.trim().toUpperCase();
  return REGION_PMC_METHODS[code] ?? FALLBACK_PMC_METHODS;
}

export function regionalPmcMethods(currency: string): ReadonlySet<string> {
  return new Set(regionalPmcMethodList(currency));
}

export function humanizePmcMethod(method: string): string {
  return (
    LABEL_BY_PMC_METHOD[method] ??
    method
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}
