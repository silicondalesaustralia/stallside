import { formatMoney } from "@/lib/money";
import type { BillingCurrency } from "@/lib/saas-pricing";
import { BILLING_CURRENCIES, isBillingCurrency } from "@/lib/saas-pricing";

/** Fallback AUD per 1 unit if Frankfurter is unreachable (approx mid-2026). */
const FALLBACK_AUD_PER_UNIT: Record<Exclude<BillingCurrency, "AUD">, number> = {
  USD: 1.52,
  GBP: 2.05,
  EUR: 1.75,
};

export type AudRates = Record<string, number>;

async function fetchAudPerUnit(
  from: Exclude<BillingCurrency, "AUD">,
): Promise<number> {
  const res = await fetch(
    `https://api.frankfurter.dev/v1/latest?base=${from}&symbols=AUD`,
    { next: { revalidate: 21_600 } },
  );
  if (!res.ok) {
    throw new Error(`FX ${from}/AUD failed: ${res.status}`);
  }
  const data = (await res.json()) as { rates?: { AUD?: number } };
  const rate = data.rates?.AUD;
  if (typeof rate !== "number" || !(rate > 0)) {
    throw new Error(`FX ${from}/AUD missing rate`);
  }
  return rate;
}

/** Live rates: AUD received for 1 unit of each billing currency. */
export async function audRatesFromMarket(): Promise<AudRates> {
  const rates: AudRates = { AUD: 1 };
  const others = BILLING_CURRENCIES.filter((c) => c !== "AUD") as Exclude<
    BillingCurrency,
    "AUD"
  >[];
  try {
    const pairs = await Promise.all(
      others.map(async (code) => [code, await fetchAudPerUnit(code)] as const),
    );
    for (const [code, rate] of pairs) rates[code] = rate;
    return rates;
  } catch (error) {
    console.error("FX to AUD fallback", error);
    for (const code of others) rates[code] = FALLBACK_AUD_PER_UNIT[code];
    return rates;
  }
}

/** Convert Stripe/billing cents into AUD cents using market FX rates. */
export function billingCentsToAud(
  cents: number,
  currency: string | null | undefined,
  rates: AudRates,
): number {
  if (cents === 0) return 0;
  const raw = (currency ?? "AUD").trim().toUpperCase();
  const code = isBillingCurrency(raw) ? raw : "AUD";
  if (code === "AUD") return cents;
  const rate = rates[code];
  if (typeof rate !== "number" || !(rate > 0)) return cents;
  return Math.round(cents * rate);
}

/** e.g. USD $14.99 (A$21.36) - native Stripe currency plus AUD. */
export function formatBillingWithAud(
  cents: number,
  currency: string | null | undefined,
  rates: AudRates,
): string {
  const raw = (currency ?? "AUD").trim().toUpperCase();
  const code = isBillingCurrency(raw) ? raw : "AUD";
  const native = formatMoney(cents, code);
  if (code === "AUD" || cents === 0) return native;
  const aud = formatMoney(billingCentsToAud(cents, code, rates), "AUD");
  return `${code} ${native} (${aud})`;
}
