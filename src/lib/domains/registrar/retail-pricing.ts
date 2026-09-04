/** Vendl retail price from Namecheap wholesale (USD → AUD + margin). */

import type { MoneyCents } from "./types";

function envNum(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

/** Convert registrar USD cents → Vendl retail AUD cents. Tax not guessed. */
export function retailFromRegistrarUsd(registrarUsd: MoneyCents): {
  retail: MoneyCents;
  fxRate: number;
  markupPercent: number;
  minMarginCents: number;
} {
  const usd =
    registrarUsd.currencyCode.toUpperCase() === "USD"
      ? registrarUsd.value
      : registrarUsd.value;
  const fx = envNum("DOMAIN_FX_USD_AUD", 1.55);
  const bufferPct = envNum("DOMAIN_FX_BUFFER_PERCENT", 5);
  const markupPct = envNum("DOMAIN_PRICING_MARKUP_PERCENT", 25);
  const minMarginCents = Math.round(
    envNum("DOMAIN_PRICING_MIN_MARGIN_AUD", 5) * 100,
  );

  const audCost = Math.ceil(usd * fx * (1 + bufferPct / 100));
  const withMarkup = Math.ceil(audCost * (1 + markupPct / 100));
  const retailValue = Math.max(withMarkup, audCost + minMarginCents);

  return {
    retail: { currencyCode: "AUD", value: retailValue },
    fxRate: fx,
    markupPercent: markupPct,
    minMarginCents,
  };
}
