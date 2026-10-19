import type { MobilePreOrderItem, MobilePreOrderPage } from "@/contracts/mobile/preorders";
import type { OwnerPreOrderPage, OwnerPreOrderPageRow } from "@/lib/pre-order-pages/service";
import { formatCollectionLabel, formatOrderByLabel } from "@/lib/pre-order";
import { preOrderPageUrl } from "@/lib/preorder-page";

export function toMobilePreOrderPage(page: OwnerPreOrderPageRow | OwnerPreOrderPage): MobilePreOrderPage {
  const tz = page.stand.timezone;
  return {
    id: page.id,
    title: page.title,
    isActive: page.isActive,
    collectionLabel: formatCollectionLabel(page.collectionAt, tz),
    orderByLabel: formatOrderByLabel(page.orderByAt, tz),
    ordersOpen: page.orderByAt.getTime() > Date.now(),
    productCount: page._count.items,
    url: preOrderPageUrl(page.stand.slug, page.slug),
  };
}

export function toMobilePreOrderItems(page: OwnerPreOrderPage): MobilePreOrderItem[] {
  return page.items.map(({ product }) => ({
    productId: product.id,
    name: product.name,
    priceCents: product.priceCents,
    stock: product.stockQuantity,
    imageUrl: product.imageUrl,
    hidden: product.isHidden,
  }));
}
