import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  mobileOrderDetail,
  orderPaymentMessage,
  type RefundOrderBody,
} from "@contracts/mobile/order-detail";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

const orderPath = (orderId: string) => `/orders/${encodeURIComponent(orderId)}`;

function useRefreshAfterPayment(orderId: string) {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["order", orderId] }),
      queryClient.invalidateQueries({ queryKey: ["orders"] }),
      queryClient.invalidateQueries({ queryKey: ["home"] }),
      queryClient.invalidateQueries({ queryKey: ["products"] }),
      queryClient.invalidateQueries({ queryKey: ["inventory"] }),
    ]);
  };
}

export function useMarkOrderPaid(orderId: string) {
  const token = useToken();
  const refresh = useRefreshAfterPayment(orderId);
  return useMutation({
    mutationFn: () =>
      apiFetch(`${orderPath(orderId)}/paid`, {
        method: "POST",
        token,
        schema: mobileOrderDetail,
      }),
    onSuccess: refresh,
  });
}

export function useRefundOrder(orderId: string) {
  const token = useToken();
  const refresh = useRefreshAfterPayment(orderId);
  return useMutation({
    mutationFn: (body: RefundOrderBody) =>
      apiFetch(`${orderPath(orderId)}/refund`, {
        method: "POST",
        token,
        body,
        schema: orderPaymentMessage,
      }),
    onSettled: refresh,
  });
}

export function useCheckPayPalRefund(orderId: string) {
  const token = useToken();
  const refresh = useRefreshAfterPayment(orderId);
  return useMutation({
    mutationFn: () =>
      apiFetch(`${orderPath(orderId)}/paypal-refund`, {
        method: "POST",
        token,
        schema: orderPaymentMessage,
      }),
    onSuccess: refresh,
  });
}
