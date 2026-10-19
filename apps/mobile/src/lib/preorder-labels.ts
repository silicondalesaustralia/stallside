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

export function paymentLabel(detail: PreOrderDetailResponse): string {
  if (detail.paymentTiming === "DEPOSIT_THEN_BALANCE") {
    return `${detail.depositPercent ?? 0}% deposit, rest on ${detail.handoverMode === "DELIVER" ? "delivery" : "collection"}`;
  }
  return "Paid in full when ordering";
}

export function handoverLabel(detail: PreOrderDetailResponse): string {
  return detail.handoverMode === "DELIVER" ? "Delivered" : "Collected";
}
