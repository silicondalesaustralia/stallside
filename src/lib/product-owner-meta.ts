import { dollarsToCents } from "@/lib/money";

export type ProductOwnerMeta = {
  sku: string | null;
  upc: string | null;
  costCents: number | null;
};

/** Parse optional SKU / UPC / cost from product forms (owner-only). */
export function parseProductOwnerMeta(
  formData: FormData,
): { ok: true; data: ProductOwnerMeta } | { ok: false; error: string } {
  const sku = String(formData.get("sku") ?? "").trim().slice(0, 64) || null;
  const upc = String(formData.get("upc") ?? "").trim().slice(0, 32) || null;
  const costRaw = String(formData.get("cost") ?? "").trim();
  let costCents: number | null = null;
  if (costRaw) {
    try {
      costCents = dollarsToCents(costRaw);
    } catch {
      return { ok: false, error: "Invalid cost." };
    }
    if (costCents < 0) return { ok: false, error: "Cost cannot be negative." };
  }
  return { ok: true, data: { sku, upc, costCents } };
}

export function profitCents(
  priceCents: number,
  costCents: number | null,
): number | null {
  if (costCents == null) return null;
  return priceCents - costCents;
}
