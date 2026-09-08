import { OnlinePaymentProvider } from "@/generated/prisma/client";
import {
  isSquarePaymentsEnabled,
  isSquareConnectEnabled,
} from "@/lib/square/config";
import {
  isBillingCurrency,
  type BillingCurrency,
} from "@/lib/saas-pricing";

export type OnlineRail = "stripe" | "square" | "none";

/** Square online payments are Australia (AUD) only for now. */
export function squareEligibleBillingCurrency(
  billingCurrency: string | null | undefined,
): boolean {
  const raw = (billingCurrency ?? "AUD").trim().toUpperCase();
  return raw === "AUD";
}

/** Env + region gate for Settings hub / Square pages. */
export function squareSettingsVisible(
  billingCurrency?: string | null,
): boolean {
  if (!isSquareConnectEnabled()) return false;
  if (billingCurrency === undefined) return true;
  return squareEligibleBillingCurrency(billingCurrency);
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
    throw new Error("Square is only available for Australian (AUD) accounts.");
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
