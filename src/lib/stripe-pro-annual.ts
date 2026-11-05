import { cleanEnvSecret } from "@/lib/env";
import { BILLING_CURRENCIES, type BillingCurrency } from "@/lib/saas-pricing";

/** Static process.env reads only - see proPriceEnv in stripe.ts. */
function annualPriceEnv(currency: BillingCurrency): string | undefined {
  switch (currency) {
    case "AUD":
      return process.env.STRIPE_PRICE_ID_PRO_ANNUAL_AUD;
    case "USD":
      return process.env.STRIPE_PRICE_ID_PRO_ANNUAL_USD;
    case "GBP":
      return process.env.STRIPE_PRICE_ID_PRO_ANNUAL_GBP;
    case "EUR":
      return process.env.STRIPE_PRICE_ID_PRO_ANNUAL_EUR;
  }
}

export function tryProAnnualPriceId(currency: BillingCurrency): string | null {
  return cleanEnvSecret(annualPriceEnv(currency)) || null;
}

/** Currencies with a yearly Pro price configured; annual is only offered for these. */
export function listProAnnualCurrencies(): BillingCurrency[] {
  return BILLING_CURRENCIES.filter((currency) => tryProAnnualPriceId(currency) !== null);
}
