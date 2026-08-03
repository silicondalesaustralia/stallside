export type PaymentBrand =
  | "cash"
  | "card"
  | "apple"
  | "google"
  | "paypal"
  | "stripe"
  | "payid"
  | "payto"
  | "cashapp"
  | "link"
  | "zip"
  | "klarna";

/** Brands that use a wide wordmark asset (not a square mark). */
export const WORDMARK_BRANDS: ReadonlySet<PaymentBrand> = new Set([
  "payid",
  "payto",
  "zip",
  "klarna",
]);

/** Digital pay methods shown when Stripe card checkout is on. */
export const STRIPE_CHECKOUT_BRANDS: PaymentBrand[] = [
  "card",
  "apple",
  "google",
  "zip",
  "klarna",
];

/** AUD checkout extras shown beside Stripe methods (PayTo is Australia-only). */
export const AUD_STRIPE_CHECKOUT_BRANDS: PaymentBrand[] = [
  ...STRIPE_CHECKOUT_BRANDS,
  "payto",
];

/** USD extras (Cash App is common on US connected accounts). */
export const USD_STRIPE_CHECKOUT_BRANDS: PaymentBrand[] = [
  "card",
  "apple",
  "google",
  "cashapp",
  "zip",
  "klarna",
];

export function stripeCheckoutBrandsForCurrency(
  currency: string,
): PaymentBrand[] {
  const code = currency.trim().toUpperCase();
  if (code === "AUD") return AUD_STRIPE_CHECKOUT_BRANDS;
  if (code === "USD") return USD_STRIPE_CHECKOUT_BRANDS;
  return STRIPE_CHECKOUT_BRANDS;
}

export function paymentBrandSrc(brand: PaymentBrand): string | null {
  switch (brand) {
    case "payid":
      return "/brand/payid.png";
    case "payto":
      return "/brand/payto.png";
    case "stripe":
      return "/brand/stripe.png";
    case "zip":
      return "/brand/zip.svg";
    case "klarna":
      return "/brand/klarna.svg";
    default:
      return null;
  }
}

export function paymentBrandLabel(brand: PaymentBrand): string {
  switch (brand) {
    case "cash":
      return "Cash";
    case "payid":
      return "PayID";
    case "payto":
      return "PayTo";
    case "cashapp":
      return "Cash App";
    case "link":
      return "Link";
    case "card":
      return "Card";
    case "apple":
      return "Apple Pay";
    case "google":
      return "Google Pay";
    case "paypal":
      return "PayPal";
    case "stripe":
      return "Stripe";
    case "zip":
      return "Zip";
    case "klarna":
      return "Klarna";
  }
}
