import { useQuery } from "@tanstack/react-query";
import { mobileOrderDetail } from "@contracts/mobile/order-detail";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

export function useOrder(orderId: string | undefined) {
  const token = useToken();
  return useQuery({
    queryKey: ["order", orderId],
    enabled: Boolean(token && orderId),
    queryFn: () =>
      apiFetch(`/orders/${encodeURIComponent(orderId ?? "")}`, {
        token,
        schema: mobileOrderDetail,
      }),
  });
}
