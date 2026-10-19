import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mobileOk } from "@contracts/mobile/common";
import { ordersResponse } from "@contracts/mobile/orders";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

const PAGE_SIZE = 30;
const POLL_MS = 45_000;

export function ordersQueryKey(standId: string | null) {
  return ["orders", standId] as const;
}

export function useOrders(standId: string | null) {
  const token = useToken();
  return useInfiniteQuery({
    queryKey: ordersQueryKey(standId),
    enabled: Boolean(token && standId),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ standId: standId ?? "", limit: String(PAGE_SIZE) });
      if (pageParam) params.set("cursor", pageParam);
      return apiFetch(`/orders?${params.toString()}`, { token, schema: ordersResponse });
    },
    getNextPageParam: (last) => last.nextCursor,
    refetchInterval: POLL_MS,
  });
}

export function useDeleteOrder() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) =>
      apiFetch(`/orders/${encodeURIComponent(orderId)}`, {
        method: "DELETE",
        token,
        schema: mobileOk,
      }),
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
        queryClient.invalidateQueries({ queryKey: ["home"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
      ]);
    },
  });
}
