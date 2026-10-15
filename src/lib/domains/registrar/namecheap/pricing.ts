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

function cents(raw: string | undefined): number {
  const n = Number.parseFloat(raw ?? "");
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : 0;
}

/**
 * What Namecheap charges this account for one TLD + duration: YourPrice plus its
 * additional (ICANN) fee, read only from that TLD's <Product> block. Never falls
 * back to another TLD, duration or the public list price.
 */
export function namecheapPriceFromXml(
  xml: string,
  tld: string,
  periodYears: number,
  category: "REGISTER" | "RENEW" = "REGISTER",
): { cost: MoneyCents; row: Record<string, string> } | null {
  const scoped =
    xml.match(
      new RegExp(`<ProductCategory\\b[^>]*\\bName="${category}"[^>]*>([\\s\\S]*?)</ProductCategory>`, "i"),
    )?.[1] ?? xml;
  const escaped = tld.toLowerCase().replace(/\./g, "\\.");
  const block = scoped.match(
    new RegExp(`<Product\\b[^>]*\\bName="${escaped}"[^>]*>([\\s\\S]*?)</Product>`, "i"),
  )?.[1];
  if (!block) return null;
  const row = allTagAttrs(block, "Price").find(
    (p) =>
      String(p.Duration) === String(periodYears) &&
      (p.DurationType || "YEAR").toUpperCase().startsWith("YEAR"),
  );
  if (!row) return null;
  const base = cents(row.YourPrice) || cents(row.Price);
  if (!base) return null;
  const extra = row.YourPrice
    ? cents(row.YourAdditonalCost ?? row.YourAdditionalCost)
    : cents(row.AdditionalCost);
  return { cost: { currencyCode: row.Currency || "USD", value: base + extra }, row };
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
  const found = namecheapPriceFromXml(xml, tld, periodYears, actionName);
  if (!found) {
    throw new Error(`No ${actionName} price for .${tld} / ${periodYears}y`);
  }
  console.info("[namecheap pricing]", actionName, tld, periodYears, {
    YourPrice: found.row.YourPrice,
    YourAdditonalCost: found.row.YourAdditonalCost,
    Price: found.row.Price,
    RegularPrice: found.row.RegularPrice,
    Currency: found.row.Currency,
    charged: found.cost.value,
  });
  return found.cost;
}

export function premiumPricesFromCheck(
  row: Record<string, string>,
): { price: MoneyCents; renewal?: MoneyCents } | null {
  const reg = dollarsToCents(row.PremiumRegistrationPrice);
  if (!reg) return null;
  const ren = dollarsToCents(row.PremiumRenewalPrice);
  return { price: reg, renewal: ren || undefined };
}
