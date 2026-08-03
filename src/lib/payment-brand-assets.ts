export type PaymentBrand =
  | "cash"
  | "card"
  | "apple"
  | "google"
  | "paypal"
  | "stripe"
  | "payid"
  | "afterpay"
  | "zip"
  | "klarna";

/** Brands that use a wide wordmark asset (not a square mark). */
export const WORDMARK_BRANDS: ReadonlySet<PaymentBrand> = new Set([
  "payid",
  "afterpay",
  "zip",
  "klarna",
]);

/** Digital pay methods shown when Stripe card checkout is on. */
export const STRIPE_CHECKOUT_BRANDS: PaymentBrand[] = [
  "card",
  "apple",
  "google",
  "afterpay",
  "zip",
  "klarna",
];

export function paymentBrandSrc(brand: PaymentBrand): string | null {
  switch (brand) {
    case "payid":
      return "/brand/payid.png";
    case "stripe":
      return "/brand/stripe.png";
    case "afterpay":
      return "/brand/afterpay.svg";
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
    case "afterpay":
      return "Afterpay";
    case "zip":
      return "Zip";
    case "klarna":
      return "Klarna";
  }
}
