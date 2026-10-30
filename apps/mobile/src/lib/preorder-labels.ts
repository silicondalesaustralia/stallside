import type {
  MobilePreOrderPage,
  PreOrderDetailResponse,
} from "@contracts/mobile/preorders";

export function preOrderMeta(page: MobilePreOrderPage): string {
  const products = `${page.productCount} product${page.productCount === 1 ? "" : "s"}`;
  return `${page.collectionLabel} · ${products}`;
}

export function preOrderDeadline(page: MobilePreOrderPage): string {
  return page.ordersOpen
    ? `Order by ${page.orderByLabel}`
    : `Orders closed ${page.orderByLabel}`;
}

export function handoverLabel(detail: PreOrderDetailResponse): string {
  return detail.handoverMode === "DELIVER" ? "Delivered" : "Collected";
}
