import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";

/** Everything on the Upsells page besides the upsell list: business defaults and per-product / pre-order add-ons. */
export async function loadUpsellOverview(ownerId: string, standId: string) {
  const stand = await prisma.stand.findFirst({ where: { id: standId, ownerId } });
  if (!stand) return null;
  const [products, overrides, preOrderPages] = await Promise.all([
    prisma.product.findMany({
      where: { standId, isArchived: false, isHidden: false },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, priceCents: true },
    }),
    prisma.product.findMany({
      where: { standId, isArchived: false, upsellProductId: { not: null } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, upsellProductId: true },
    }),
    prisma.preOrderPage.findMany({
      where: { standId, ownerId, isActive: true, preOrderUpsellName: { not: null } },
      orderBy: { title: "asc" },
      select: { id: true, title: true, preOrderUpsellName: true },
    }),
  ]);
  const nameById = new Map(products.map((p) => [p.id, p.name]));
  return {
    stand,
    /** Visible products, for the business default picker. */
    products,
    productOverrides: overrides.map((p) => ({
      id: p.id,
      name: p.name,
      offers: (p.upsellProductId && nameById.get(p.upsellProductId)) || "another product",
    })),
    preOrderAddOns: preOrderPages.map((p) => ({ id: p.id, name: p.title, offers: p.preOrderUpsellName ?? "" })),
  };
}
export type UpsellOverview = NonNullable<Awaited<ReturnType<typeof loadUpsellOverview>>>;

export function defaultUpsellLabel(overview: UpsellOverview): string | null {
  const { stand, products } = overview;
  const product = products.find((p) => p.id === stand.upsellProductId);
  if (!product) return null;
  return `${product.name} (${formatMoney(stand.upsellPriceCents ?? product.priceCents, stand.currency)})`;
}

export function firstOrderDiscountLabel({ stand }: UpsellOverview): string | null {
  if (!stand.firstOrderDiscountEnabled) return null;
  const off =
    stand.firstOrderDiscountAmountCents != null
      ? formatMoney(stand.firstOrderDiscountAmountCents, stand.currency)
      : `${stand.firstOrderDiscountPercent}%`;
  return `${off} off a customer's first order`;
}
