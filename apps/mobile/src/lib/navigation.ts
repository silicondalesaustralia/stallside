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

export function openProduct(productId: string) {
  router.push({ pathname: "/product/[productId]", params: { productId } });
}
