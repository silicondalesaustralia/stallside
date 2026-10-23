import { formatMoney } from "@/lib/money";
import { billingCentsToAud, type AudRates } from "@/lib/fx-to-aud";

export type CurrencyTotals = Record<string, number>;

export function addToTotals(
  totals: CurrencyTotals,
  currency: string | null | undefined,
  cents: number,
): CurrencyTotals {
  const code = (currency ?? "AUD").trim().toUpperCase() || "AUD";
  totals[code] = (totals[code] ?? 0) + cents;
  return totals;
}

export function totalsAreEmpty(totals: CurrencyTotals): boolean {
  return Object.values(totals).every((cents) => cents === 0);
}

/** e.g. "A$40.00 · US$12.50" (zero shown in the fallback currency). */
export function formatTotals(totals: CurrencyTotals, fallback = "AUD"): string {
  const parts = Object.entries(totals)
    .filter(([, cents]) => cents !== 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([code, cents]) => formatMoney(cents, code));
  return parts.length ? parts.join(" · ") : formatMoney(0, fallback);
}

export function totalsToAud(totals: CurrencyTotals, rates: AudRates): number {
  return Object.entries(totals).reduce(
    (sum, [code, cents]) => sum + billingCentsToAud(cents, code, rates),
    0,
  );
}
