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
  afterpay_clearpay: "afterpay",
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
  afterpay_clearpay: "Afterpay",
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
  "afterpay_clearpay",
  "klarna",
  "zip",
  "affirm",
  "paypal",
];

export function humanizePmcMethod(method: string): string {
  return (
    LABEL_BY_PMC_METHOD[method] ??
    method
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}
