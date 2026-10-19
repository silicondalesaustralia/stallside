import { router } from "expo-router";

export function openOrder(orderId: string) {
  router.push({ pathname: "/order/[orderId]", params: { orderId } });
}
