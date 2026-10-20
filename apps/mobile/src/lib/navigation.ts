import { router } from "expo-router";

export function openOrder(orderId: string) {
  router.push({ pathname: "/order/[orderId]", params: { orderId } });
}

export function openReview(reviewId: string) {
  router.push({ pathname: "/reviews/[reviewId]", params: { reviewId } });
}

/** Pass "new" to open a blank discount form. */
export function openDiscount(discountId: string) {
  router.push({ pathname: "/discounts/[discountId]", params: { discountId } });
}

export function openSubscription(offerId: string) {
  router.push({ pathname: "/subscriptions/[offerId]", params: { offerId } });
}

export function openQr(kind: "business" | "code", id: string) {
  router.push({ pathname: "/qr/[kind]/[id]", params: { kind, id } });
}

export function openCategory(categoryId: string) {
  router.push({ pathname: "/categories/[categoryId]", params: { categoryId } });
}

export function openPreOrderPage(pageId: string) {
  router.push({ pathname: "/pre-orders/[pageId]", params: { pageId } });
}

/** Pass "new" to open a blank upsell form. */
export function openUpsell(upsellId: string) {
  router.push({ pathname: "/upsells/[upsellId]", params: { upsellId } });
}

export function openCampaign(campaignId: string) {
  router.push({
    pathname: "/communication/[campaignId]",
    params: { campaignId },
  });
}

/** Opens the composer, optionally addressed to a saved list or one customer. */
export function composeMessage(
  params: { listId?: string; customerId?: string } = {},
) {
  router.push({ pathname: "/communication/new", params });
}

export function openSupplier(memberId: string) {
  router.push({ pathname: "/suppliers/[memberId]", params: { memberId } });
}

export function openProduct(productId: string) {
  router.push({ pathname: "/product/[productId]", params: { productId } });
}
