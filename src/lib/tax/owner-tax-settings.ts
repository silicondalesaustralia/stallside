import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { syncOwnerOrderGst } from "@/lib/order-gst-sync";
import { formatTaxRate, taxConfig } from "./config";
import { countryForCurrency, taxRegion } from "./regions";

const ABN_WEIGHTS = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];

function isValidAbn(digits: string): boolean {
  if (!/^\d{11}$/.test(digits)) return false;
  const sum = digits
    .split("")
    .map(Number)
    .reduce((acc, d, i) => acc + (i === 0 ? d - 1 : d) * ABN_WEIGHTS[i], 0);
  return sum % 89 === 0;
}

function parseRateBps(raw: string): number | null | "invalid" {
  const value = raw.trim().replace("%", "");
  if (!value) return null;
  const pct = Number(value);
  if (!Number.isFinite(pct) || pct < 0 || pct > 30) return "invalid";
  return Math.round(pct * 100);
}

/** The owner's tax settings as the Tax page shows them (country pre-filled from currency). */
export async function loadOwnerTaxSettings(ownerId: string) {
  const owner = await prisma.owner.findUniqueOrThrow({
    where: { id: ownerId },
    select: {
      taxCountry: true,
      taxRateBps: true,
      gstRegistered: true,
      abn: true,
      taxShipping: true,
      billingCurrency: true,
      country: true,
    },
  });
  const country = owner.taxCountry ?? countryForCurrency(owner.billingCurrency) ?? owner.country;
  const region = taxRegion(country);
  const config = taxConfig(owner, owner.billingCurrency);
  const status = config.applies
    ? `${config.name} on at ${formatTaxRate(config.rateBps)}, ${config.inclusive ? "included in your prices" : "added at checkout"}.`
    : `${region.name} is off. Orders record no tax.`;
  return { owner, country, region, status };
}

export type TaxSettingsInput = {
  country: string;
  /** Percentage as typed, e.g. "10" or "8.25"; blank uses the country default. */
  rate: string;
  taxId: string;
  registered: boolean;
  taxShipping: boolean;
};

/** Saves GST / VAT / sales tax settings for all of the owner's businesses. */
export async function updateOwnerTaxSettings(
  ownerId: string,
  input: TaxSettingsInput,
): Promise<{ ok: true } | { error: string }> {
  const country = input.country.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(country)) return { error: "Choose a country." };
  const region = taxRegion(country);
  const parsed = parseRateBps(input.rate);
  if (parsed === "invalid") return { error: "Enter the rate as a percentage, e.g. 10 or 8.25." };
  const rateBps = parsed === region.defaultRateBps ? null : parsed;
  const taxId = input.taxId.replace(/\s/g, "");

  if (country === "AU") {
    if (taxId && !isValidAbn(taxId)) return { error: "That ABN doesn't look right - check the 11 digits." };
    if (input.registered && !taxId) return { error: "Add your ABN to turn on GST." };
  }
  if (input.registered && (rateBps ?? region.defaultRateBps) == null) {
    return { error: `Enter your ${region.name.toLowerCase()} rate to turn it on.` };
  }

  await prisma.owner.update({
    where: { id: ownerId },
    data: {
      taxCountry: country,
      taxRateBps: rateBps,
      gstRegistered: input.registered,
      abn: taxId || null,
      taxShipping: input.taxShipping,
    },
  });
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

/** Recalculates tax on past orders after registration, rate or tax-free products change. */
export async function syncOwnerPastOrderTax(ownerId: string): Promise<string> {
  const { updated } = await syncOwnerOrderGst(ownerId);
  revalidatePath("/dashboard/orders");
  return updated
    ? `Synced tax on ${updated} past order${updated === 1 ? "" : "s"}.`
    : "Past orders are already up to date.";
}
