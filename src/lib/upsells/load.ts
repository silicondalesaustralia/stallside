import type { MobileUpsellRow, UpsellFormOptions, UpsellInputValues } from "@/contracts/mobile/upsells";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";

function count(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

/** Summary of each upsell: what it offers, where and on which checkout. */
export async function listOwnerUpsellRows(ownerId: string, standId: string): Promise<MobileUpsellRow[]> {
  const upsells = await prisma.upsell.findMany({
    where: { standId, ownerId },
    orderBy: { updatedAt: "desc" },
    include: { offerProduct: { select: { name: true } } },
  });
  return upsells.map((u) => {
    const parts = [
      u.sitewide ? "sitewide" : null,
      u.categoryIds.length ? count(u.categoryIds.length, "category", "categories") : null,
      u.productIds.length ? count(u.productIds.length, "product", "products") : null,
    ].filter(Boolean);
    const channels =
      u.showOnWebsite && u.showAtStall ? "online store and stall" : u.showOnWebsite ? "online store only" : "stall only";
    return {
      id: u.id,
      name: u.name,
      offer: u.offerProduct.name,
      scope: parts.join(", "),
      channels,
      isActive: u.isActive,
    };
  });
}

/** The upsell as form values, plus the business it belongs to. */
export async function getOwnerUpsell(ownerId: string, id: string) {
  const upsell = await prisma.upsell.findFirst({ where: { id, ownerId } });
  if (!upsell) return null;
  const input: UpsellInputValues = {
    name: upsell.name,
    offerProductId: upsell.offerProductId,
    price: upsell.priceCents != null ? (upsell.priceCents / 100).toFixed(2) : "",
    isActive: upsell.isActive,
    sitewide: upsell.sitewide,
    categoryIds: upsell.categoryIds,
    productIds: upsell.productIds,
    showOnWebsite: upsell.showOnWebsite,
    showAtStall: upsell.showAtStall,
  };
  return { id: upsell.id, standId: upsell.standId, name: upsell.name, input };
}

/** Products and categories the upsell form can pick from, for one business; null if it isn't the owner's. */
export async function loadUpsellFormOptions(ownerId: string, standId: string): Promise<UpsellFormOptions | null> {
  const stand = await prisma.stand.findFirst({ where: { id: standId, ownerId }, select: { currency: true } });
  if (!stand) return null;
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { standId, isArchived: false },
      orderBy: { name: "asc" },
      select: { id: true, name: true, priceCents: true, isHidden: true, isPreOrder: true },
    }),
    prisma.category.findMany({
      where: { ownerId, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      select: { id: true, title: true },
    }),
  ]);
  return {
    currency: stand.currency,
    offerProducts: products
      .filter((p) => !p.isHidden && !p.isPreOrder)
      .map((p) => ({ id: p.id, label: `${p.name} (${formatMoney(p.priceCents, stand.currency)})` })),
    categories: categories.map((c) => ({ id: c.id, label: c.title })),
    products: products.filter((p) => !p.isPreOrder).map((p) => ({ id: p.id, label: p.name })),
  };
}
