import {
  billingRegionLabel,
  isBillingCurrency,
  type BillingCurrency,
} from "@/lib/saas-pricing";

/**
 * Stripe Connect Express `country` (immutable after create).
 * Derived from SaaS billing currency - stand display currency is separate.
 */
const CONNECT_COUNTRY: Record<BillingCurrency, string> = {
  AUD: "AU",
  USD: "US",
  GBP: "GB",
  /** Ireland - EUR Connect needs a specific country; owners can still settle EUR. */
  EUR: "IE",
};

export function billingCurrencyForConnect(
  value: string | null | undefined,
): BillingCurrency {
  const raw = (value ?? "AUD").trim().toUpperCase();
  return isBillingCurrency(raw) ? raw : "AUD";
}

export function stripeConnectCountry(
  billingCurrency: string | null | undefined,
): string {
  return CONNECT_COUNTRY[billingCurrencyForConnect(billingCurrency)];
}

export function stripeConnectDefaultCurrency(
  billingCurrency: string | null | undefined,
): string {
  return billingCurrencyForConnect(billingCurrency).toLowerCase();
}

export function stripeConnectRegionLabel(
  billingCurrency: string | null | undefined,
): string {
  return billingRegionLabel(billingCurrencyForConnect(billingCurrency));
}
