import { prisma } from "@/lib/prisma";
import { parsePriceTiers } from "@/lib/price-tiers";
import { formatMoney } from "@/lib/public-product";
import { businessPageProductWhere } from "@/lib/product-visibility";

export type PosterExtras = {
  bundleLines: string[];
  firstOrderLine: string | null;
  freshnessLines: string[];
};

/** Optional poster lines drawn from the business's products and first-order offer. */
export async function loadPosterExtras(standId: string): Promise<PosterExtras> {
  const stand = await prisma.stand.findUnique({
    where: { id: standId },
    select: {
      currency: true,
      firstOrderDiscountEnabled: true,
      firstOrderDiscountAmountCents: true,
      firstOrderDiscountPercent: true,
      products: {
        where: { ...businessPageProductWhere, isActive: true, isPreOrder: false },
        orderBy: { sortOrder: "asc" },
        take: 12,
        select: { name: true, priceTiers: true, freshnessNote: true },
      },
    },
  });
  if (!stand) return { bundleLines: [], firstOrderLine: null, freshnessLines: [] };

  const bundleLines: string[] = [];
  for (const p of stand.products) {
    const tiers = parsePriceTiers(p.priceTiers);
    if (!tiers.length) continue;
    const parts = tiers.map((t) => `${t.qty}× ${formatMoney(t.totalCents, stand.currency)}`);
    bundleLines.push(`${p.name}: ${parts.join(" · ")}`);
  }

  const freshnessLines = stand.products
    .map((p) => p.freshnessNote?.trim())
    .filter((n): n is string => Boolean(n))
    .slice(0, 4);

  let firstOrderLine: string | null = null;
  if (stand.firstOrderDiscountEnabled) {
    const amount = stand.firstOrderDiscountAmountCents;
    firstOrderLine =
      amount != null && amount > 0
        ? `First time? Get ${formatMoney(amount, stand.currency)} off - enter your email at checkout.`
        : `First time? Get ${stand.firstOrderDiscountPercent}% off - enter your email at checkout.`;
  }

  return { bundleLines, firstOrderLine, freshnessLines };
}
