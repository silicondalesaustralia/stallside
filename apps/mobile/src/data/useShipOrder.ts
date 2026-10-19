import { useMutation, useQueryClient } from "@tanstack/react-query";
import { shipOrderResponse, type ShipOrderBody } from "@contracts/mobile/order-detail";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

function useRefreshOrder(orderId: string) {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["order", orderId] }),
      queryClient.invalidateQueries({ queryKey: ["orders"] }),
    ]);
  };
}

export function useShipOrder(orderId: string) {
  const token = useToken();
  const refresh = useRefreshOrder(orderId);
  return useMutation({
    mutationFn: (body: ShipOrderBody) =>
      apiFetch(`/orders/${encodeURIComponent(orderId)}/ship`, {
        method: "POST",
        token,
        body,
        schema: shipOrderResponse,
      }),
    onSuccess: refresh,
  });
}

export function useDeliverOrder(orderId: string) {
  const token = useToken();
  const refresh = useRefreshOrder(orderId);
  return useMutation({
    mutationFn: () =>
      apiFetch(`/orders/${encodeURIComponent(orderId)}/deliver`, {
        method: "POST",
        token,
        schema: shipOrderResponse,
      }),
    onSuccess: refresh,
  });
}
