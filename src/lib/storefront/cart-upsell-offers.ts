import { prisma } from "@/lib/prisma";
import { resolveAddonPricing } from "@/lib/preorder-upsell-pricing";
import type { CartUpsellOffer, PagePreOrderUpsell } from "@/lib/cart-upsell";

type StockedProduct = { id: string; name: string; priceCents: number; stockQuantity: number };

type UpsellStand = {
  id: string;
  products: StockedProduct[];
  upsellProductId: string | null;
  upsellPriceCents: number | null;
  preOrderUpsellProductId: string | null;
  preOrderUpsellName: string | null;
  preOrderUpsellPriceCents: number | null;
  preOrderUpsellDiscountKind: Parameters<typeof resolveAddonPricing>[1];
  preOrderUpsellDiscountValue: Parameters<typeof resolveAddonPricing>[2];
};

export function standCartUpsell(stand: UpsellStand): CartUpsellOffer | null {
  const product = stand.upsellProductId
    ? stand.products.find((p) => p.id === stand.upsellProductId)
    : null;
  if (!product || product.stockQuantity <= 0) return null;
  return {
    productId: product.id,
    name: product.name,
    priceCents: stand.upsellPriceCents ?? product.priceCents,
    stockQuantity: product.stockQuantity,
  };
}

export function standPreOrderUpsell(stand: UpsellStand): CartUpsellOffer | null {
  const product = stand.preOrderUpsellProductId
    ? stand.products.find((p) => p.id === stand.preOrderUpsellProductId)
    : null;
  if (!stand.preOrderUpsellName || !product || product.stockQuantity <= 0) return null;
  const priced = resolveAddonPricing(
    stand.preOrderUpsellPriceCents ?? product.priceCents,
    stand.preOrderUpsellDiscountKind,
    stand.preOrderUpsellDiscountValue,
  );
  return {
    productId: product.id,
    name: stand.preOrderUpsellName,
    priceCents: priced.saleCents,
    compareAtCents: priced.compareAtCents,
    stockQuantity: product.stockQuantity,
  };
}

export async function standPagePreOrderUpsells(stand: UpsellStand): Promise<PagePreOrderUpsell[]> {
  const pages = await prisma.preOrderPage.findMany({
    where: {
      standId: stand.id,
      isActive: true,
      preOrderUpsellProductId: { not: null },
      preOrderUpsellName: { not: null },
    },
    select: {
      preOrderUpsellName: true,
      preOrderUpsellPriceCents: true,
      preOrderUpsellDiscountKind: true,
      preOrderUpsellDiscountValue: true,
      preOrderUpsellProductId: true,
      items: { select: { productId: true } },
    },
  });
  const offers: PagePreOrderUpsell[] = [];
  for (const page of pages) {
    const product = stand.products.find((p) => p.id === page.preOrderUpsellProductId);
    if (!page.preOrderUpsellName || !product || product.stockQuantity <= 0) continue;
    const priced = resolveAddonPricing(
      page.preOrderUpsellPriceCents ?? product.priceCents,
      page.preOrderUpsellDiscountKind,
      page.preOrderUpsellDiscountValue,
    );
    offers.push({
      productId: product.id,
      name: page.preOrderUpsellName,
      priceCents: priced.saleCents,
      compareAtCents: priced.compareAtCents,
      stockQuantity: product.stockQuantity,
      pageProductIds: page.items.map((i) => i.productId),
    });
  }
  return offers;
}
