import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

/** PMC method key → Connect capability id. */
const CAPABILITY_BY_METHOD: Record<string, string> = {
  payto: "payto_payments",
  zip: "zip_payments",
  klarna: "klarna_payments",
  cashapp: "cashapp_payments",
  affirm: "affirm_payments",
};

/** Capabilities to request for new Connect accounts by country. */
export function connectCapabilitiesForCountry(
  country: string,
): Stripe.AccountCreateParams.Capabilities {
  const caps: Stripe.AccountCreateParams.Capabilities = {
    card_payments: { requested: true },
    transfers: { requested: true },
  };
  if (country.toUpperCase() === "AU") {
    caps.payto_payments = { requested: true };
    caps.zip_payments = { requested: true };
    caps.klarna_payments = { requested: true };
  }
  if (country.toUpperCase() === "US") {
    caps.cashapp_payments = { requested: true };
    caps.affirm_payments = { requested: true };
    caps.klarna_payments = { requested: true };
  }
  return caps;
}

/** Request regional payment capabilities on an existing connected account. */
export async function ensureRegionalConnectCapabilities(
  stripeAccountId: string,
  country: string,
): Promise<void> {
  const caps = connectCapabilitiesForCountry(country);
  const stripe = getStripe();
  await stripe.accounts.update(stripeAccountId, { capabilities: caps });
}

export async function requestCapabilityForPaymentMethod(params: {
  stripeAccountId: string;
  method: string;
}): Promise<void> {
  const capability = CAPABILITY_BY_METHOD[params.method];
  if (!capability) return;
  const stripe = getStripe();
  await stripe.accounts.update(params.stripeAccountId, {
    capabilities: {
      [capability]: { requested: true },
    },
  });
}
