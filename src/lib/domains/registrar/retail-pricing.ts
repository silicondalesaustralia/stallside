/** Vendl retail price from Namecheap wholesale (USD → seller currency + margin). */

import {
  type BillingCurrency,
  isBillingCurrency,
} from "@/lib/saas-pricing";
import type { MoneyCents } from "./types";

function envNum(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

/** USD → retail currency mid-market-ish defaults (overridable via env). */
export function usdToRetailFx(currency: BillingCurrency): number {
  switch (currency) {
    case "USD":
      return envNum("DOMAIN_FX_USD_USD", 1);
    case "AUD":
      return envNum("DOMAIN_FX_USD_AUD", 1.55);
    case "GBP":
      return envNum("DOMAIN_FX_USD_GBP", 0.79);
    case "EUR":
      return envNum("DOMAIN_FX_USD_EUR", 0.92);
  }
}

export function parseDomainRetailCurrency(
  raw: string | null | undefined,
  fallback: BillingCurrency = "AUD",
): BillingCurrency {
  const v = (raw || "").trim().toUpperCase();
  return isBillingCurrency(v) ? v : fallback;
}

/** Convert registrar USD cents → Vendl retail in chosen currency. Tax not guessed. */
export function retailFromRegistrarUsd(
  registrarUsd: MoneyCents,
  retailCurrency: BillingCurrency = "AUD",
): {
  retail: MoneyCents;
  fxRate: number;
  markupPercent: number;
  minMarginCents: number;
} {
  const usd = registrarUsd.value;
  const fx = usdToRetailFx(retailCurrency);
  const bufferPct = envNum("DOMAIN_FX_BUFFER_PERCENT", 5);
  const markupPct = envNum("DOMAIN_PRICING_MARKUP_PERCENT", 25);
  const minMarginUnits = envNum(
    `DOMAIN_PRICING_MIN_MARGIN_${retailCurrency}`,
    envNum("DOMAIN_PRICING_MIN_MARGIN_AUD", 5),
  );
  const minMarginCents = Math.round(minMarginUnits * 100);

  const localCost = Math.ceil(usd * fx * (1 + bufferPct / 100));
  const withMarkup = Math.ceil(localCost * (1 + markupPct / 100));
  const retailValue = Math.max(withMarkup, localCost + minMarginCents);

  return {
    retail: { currencyCode: retailCurrency, value: retailValue },
    fxRate: fx,
    markupPercent: markupPct,
    minMarginCents,
  };
}
