import type { PaymentBrand } from "@/lib/payment-brand-assets";

export type PaymentRegion = "AU" | "US" | "GB" | "EU";

export type CardNetwork = "visa" | "mastercard" | "amex";

export type LandingPaymentMark = {
  id: string;
  label: string;
  /** Region badge; omit for methods offered across Vendl regions. */
  region?: PaymentRegion;
  brand?: PaymentBrand;
  network?: CardNetwork;
};

/** Homepage marquee - regional methods carry a flag; cards/wallets are global. */
export const LANDING_PAYMENT_MARKS: LandingPaymentMark[] = [
  { id: "cash", label: "Cash", brand: "cash" },
  { id: "visa", label: "Visa", network: "visa" },
  { id: "mastercard", label: "Mastercard", network: "mastercard" },
  { id: "amex", label: "American Express", network: "amex" },
  { id: "apple", label: "Apple Pay", brand: "apple" },
  { id: "google", label: "Google Pay", brand: "google" },
  { id: "link", label: "Link", brand: "link" },
  { id: "payid", label: "PayID", brand: "payid", region: "AU" },
  { id: "payto", label: "PayTo", brand: "payto", region: "AU" },
  { id: "cashapp", label: "Cash App", brand: "cashapp", region: "US" },
  { id: "klarna", label: "Klarna", brand: "klarna" },
  { id: "zip", label: "Zip", brand: "zip" },
];

export const REGION_FLAG: Record<PaymentRegion, string> = {
  AU: "🇦🇺",
  US: "🇺🇸",
  GB: "🇬🇧",
  EU: "🇪🇺",
};

export const REGION_LABEL: Record<PaymentRegion, string> = {
  AU: "Australia",
  US: "United States",
  GB: "United Kingdom",
  EU: "Europe",
};
