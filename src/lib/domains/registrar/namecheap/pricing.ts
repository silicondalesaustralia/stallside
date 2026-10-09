/** Namecheap pricing helpers. */

import { allTagAttrs, namecheapCall } from "./client";
import { domainTld } from "./au-attrs";
import type { MoneyCents } from "../types";

function dollarsToCents(raw: string | undefined, currency = "USD"): MoneyCents | null {
  if (raw == null || raw === "") return null;
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) return null;
  return { currencyCode: currency, value: Math.round(n * 100) };
}

export async function namecheapPricing(
  domain: string,
  actionName: "REGISTER" | "RENEW",
  periodYears: number,
): Promise<MoneyCents> {
  const tld = domainTld(domain);
  const xml = await namecheapCall("namecheap.users.getPricing", {
    ProductType: "DOMAIN",
    ActionName: actionName,
    ProductName: tld,
  });
  const prices = allTagAttrs(xml, "Price");
  const match =
    prices.find(
      (p) =>
        String(p.Duration) === String(periodYears) &&
        (p.DurationType || "YEAR").toUpperCase().startsWith("YEAR"),
    ) ||
    prices.find((p) => String(p.Duration) === String(periodYears)) ||
    prices[0];
  const your = dollarsToCents(
    match?.YourPrice || match?.Price || match?.RegularPrice,
  );
  if (!your) {
    throw new Error(`No ${actionName} price for .${tld} / ${periodYears}y`);
  }
  return your;
}

export function premiumPricesFromCheck(
  row: Record<string, string>,
): { price: MoneyCents; renewal?: MoneyCents } | null {
  const reg = dollarsToCents(row.PremiumRegistrationPrice);
  if (!reg) return null;
  const ren = dollarsToCents(row.PremiumRenewalPrice);
  return { price: reg, renewal: ren || undefined };
}
