import { router } from "expo-router";

export function openOrder(orderId: string) {
  router.push({ pathname: "/order/[orderId]", params: { orderId } });
}

export function openReview(reviewId: string) {
  router.push({ pathname: "/reviews/[reviewId]", params: { reviewId } });
}

export function openProduct(productId: string) {
  router.push({ pathname: "/product/[productId]", params: { productId } });
}
