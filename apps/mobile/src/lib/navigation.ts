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

export function openProduct(productId: string) {
  router.push({ pathname: "/product/[productId]", params: { productId } });
}
