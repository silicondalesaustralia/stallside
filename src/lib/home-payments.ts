import type { CardNetwork } from "@/lib/landing-payment-marks";
import type { PaymentBrand } from "@/lib/payment-brand-assets";

export type HomePayMark = { label: string; note?: string } & (
  | { kind: "brand"; brand: PaymentBrand }
  | { kind: "network"; network: CardNetwork }
  | { kind: "img"; src: string }
);

export const HOME_PAYMENT_PROVIDERS: HomePayMark[] = [
  { kind: "brand", brand: "stripe", label: "Stripe" },
  { kind: "brand", brand: "square", label: "Square" },
  { kind: "brand", brand: "paypal", label: "PayPal", note: "Pro" },
];

export const HOME_PAYMENT_METHODS: HomePayMark[] = [
  { kind: "network", network: "visa", label: "Visa" },
  { kind: "network", network: "mastercard", label: "Mastercard" },
  { kind: "network", network: "amex", label: "Amex" },
  { kind: "brand", brand: "apple", label: "Apple Pay" },
  { kind: "brand", brand: "google", label: "Google Pay" },
  { kind: "brand", brand: "link", label: "Link" },
  { kind: "brand", brand: "klarna", label: "Klarna" },
  { kind: "brand", brand: "zip", label: "Zip", note: "AU" },
  { kind: "brand", brand: "payid", label: "PayID", note: "AU" },
  { kind: "brand", brand: "payto", label: "PayTo", note: "AU" },
  { kind: "brand", brand: "cashapp", label: "Cash App", note: "US" },
  { kind: "img", src: "/brand/paybybank.png", label: "Pay by Bank", note: "UK" },
  { kind: "brand", brand: "cash", label: "Cash" },
];
