/** Exact-qty volume totals. Mutually exclusive with product options. */

export type PriceTier = {
  qty: number;
  totalCents: number;
};

const MAX_TIERS = 6;

export function parsePriceTiers(raw: unknown): PriceTier[] {
  if (!Array.isArray(raw)) return [];
  const out: PriceTier[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const qty = Number((row as { qty?: unknown }).qty);
    const totalCents = Number((row as { totalCents?: unknown }).totalCents);
    if (!Number.isInteger(qty) || qty < 1 || qty > 99) continue;
    if (!Number.isInteger(totalCents) || totalCents < 0) continue;
    out.push({ qty, totalCents });
    if (out.length >= MAX_TIERS) break;
  }
  out.sort((a, b) => a.qty - b.qty);
  const seen = new Set<number>();
  return out.filter((t) => {
    if (seen.has(t.qty)) return false;
    seen.add(t.qty);
    return true;
  });
}

/** Exact tier qty → that total; otherwise base × qty. */
export function lineTotalWithTiers(
  baseUnitCents: number,
  quantity: number,
  tiers: PriceTier[],
): { lineTotalCents: number; unitPriceCents: number; usedTier: boolean } {
  const match = tiers.find((t) => t.qty === quantity);
  if (match) {
    return {
      lineTotalCents: match.totalCents,
      unitPriceCents: Math.round(match.totalCents / quantity),
      usedTier: true,
    };
  }
  return {
    lineTotalCents: baseUnitCents * quantity,
    unitPriceCents: baseUnitCents,
    usedTier: false,
  };
}

export function formatTierSaving(
  baseUnitCents: number,
  quantity: number,
  tierTotalCents: number,
): number {
  return Math.max(0, baseUnitCents * quantity - tierTotalCents);
}

export function parseTiersFromForm(formData: FormData): {
  ok: true;
  tiers: PriceTier[];
} | { ok: false; error: string } {
  const raw = String(formData.get("priceTiersJson") ?? "").trim();
  if (!raw) return { ok: true, tiers: [] };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "Invalid volume prices." };
  }
  const tiers = parsePriceTiers(parsed);
  return { ok: true, tiers };
}
