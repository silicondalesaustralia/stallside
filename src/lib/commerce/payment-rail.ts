import { OnlinePaymentProvider } from "@/generated/prisma/client";
import {
  isSquarePaymentsEnabled,
  isSquareConnectEnabled,
  squareRegionHasApp,
} from "@/lib/square/config";
import {
  connectionSquareRegion,
  squareRegionCurrency,
  squareRegionForCurrency,
  type SquareRegion,
} from "@/lib/square/region";
import {
  isBillingCurrency,
  type BillingCurrency,
} from "@/lib/saas-pricing";

export type OnlineRail = "stripe" | "square" | "none";

export const SQUARE_REGION_UNAVAILABLE =
  "Square isn't available for your billing region yet.";

/** Square region for a billing currency; US only once the US Square app is configured. */
export function squareRegionForBilling(
  billingCurrency: string | null | undefined,
): SquareRegion | null {
  const region = squareRegionForCurrency(billingCurrency);
  if (region === "US" && !squareRegionHasApp("US")) return null;
  return region;
}

export function squareEligibleBillingCurrency(
  billingCurrency: string | null | undefined,
): boolean {
  return squareRegionForBilling(billingCurrency) !== null;
}

/** Square prices must be in the seller's Square currency. */
export function squareCurrencyForBilling(
  billingCurrency: string | null | undefined,
): string | null {
  const region = squareRegionForBilling(billingCurrency);
  return region ? squareRegionCurrency(region) : null;
}

/** Tokens only work with the app (country) that issued them. */
export function squareConnectionMatchesBilling(
  conn: { providerCountry: string | null },
  billingCurrency: string | null | undefined,
): boolean {
  return squareRegionForBilling(billingCurrency) === connectionSquareRegion(conn);
}

/** Show Square in Settings UI for eligible regions (Connect still needs env flags). */
export function squareSettingsVisible(
  billingCurrency?: string | null,
): boolean {
  if (billingCurrency === undefined) return true;
  return squareEligibleBillingCurrency(billingCurrency);
}

/** Env ready to start OAuth / live Square connect. */
export function squareConnectAvailable(
  billingCurrency?: string | null,
): boolean {
  return (
    isSquareConnectEnabled() && squareSettingsVisible(billingCurrency)
  );
}

export function onlineProviderAllowed(
  billingCurrency: string | null | undefined,
  provider: OnlinePaymentProvider | string,
): boolean {
  if (provider === OnlinePaymentProvider.SQUARE || provider === "SQUARE") {
    return squareEligibleBillingCurrency(billingCurrency);
  }
  return true;
}

export function assertOnlineProviderAllowed(
  billingCurrency: string | null | undefined,
  provider: OnlinePaymentProvider | string,
): void {
  if (!onlineProviderAllowed(billingCurrency, provider)) {
    throw new Error(SQUARE_REGION_UNAVAILABLE);
  }
}

/** ISO country synced from billing currency. */
export function countryFromBillingCurrency(
  billingCurrency: string | null | undefined,
): string {
  const raw = (billingCurrency ?? "AUD").trim().toUpperCase();
  const code: BillingCurrency = isBillingCurrency(raw) ? raw : "AUD";
  switch (code) {
    case "USD":
      return "US";
    case "GBP":
      return "GB";
    case "EUR":
      return "IE";
    case "AUD":
    default:
      return "AU";
  }
}

export function resolveOnlinePaymentRail(input: {
  preferred: OnlinePaymentProvider | string | null | undefined;
  stripeReady: boolean;
  squareReady: boolean;
  billingCurrency?: string | null;
  standAcceptCard?: boolean;
  standAcceptSquare?: boolean;
}): OnlineRail {
  const preferred = input.preferred ?? OnlinePaymentProvider.STRIPE;
  const squareOk =
    isSquarePaymentsEnabled() &&
    input.squareReady &&
    (input.standAcceptSquare ?? true) &&
    squareEligibleBillingCurrency(input.billingCurrency);

  if (preferred === OnlinePaymentProvider.SQUARE) {
    if (squareOk) return "square";
    if (input.stripeReady && (input.standAcceptCard ?? true)) return "stripe";
    return "none";
  }

  if (input.stripeReady && (input.standAcceptCard ?? true)) return "stripe";
  if (squareOk) return "square";
  return "none";
}
