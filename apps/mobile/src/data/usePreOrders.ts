import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mobileOk } from "@contracts/mobile/common";
import {
  preOrderDetailResponse,
  preOrdersResponse,
  type PreOrderDetailResponse,
  type PreOrdersResponse,
} from "@contracts/mobile/preorders";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

const path = (id: string) => `/pre-orders/${encodeURIComponent(id)}`;

export function usePreOrderPages(standId: string | null) {
  const token = useToken();
  return useQuery({
    queryKey: ["pre-orders", standId],
    enabled: Boolean(token && standId),
    queryFn: () =>
      apiFetch(`/pre-orders?standId=${encodeURIComponent(standId ?? "")}`, {
        token,
        schema: preOrdersResponse,
      }),
  });
}

export function usePreOrderPage(pageId: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["pre-order", pageId],
    enabled: Boolean(token && pageId),
    queryFn: () =>
      apiFetch(path(pageId), { token, schema: preOrderDetailResponse }),
  });
}

/** Flips the switch straight away, then refetches whatever the server says. */
export function useSetPreOrderActive() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiFetch(path(id), {
        method: "PATCH",
        token,
        body: { isActive },
        schema: mobileOk,
      }),
    onMutate: ({ id, isActive }) => {
      queryClient.setQueriesData<PreOrdersResponse>(
        { queryKey: ["pre-orders"] },
        (data) =>
          data
            ? {
                pages: data.pages.map((p) =>
                  p.id === id ? { ...p, isActive } : p,
                ),
              }
            : data,
      );
      queryClient.setQueryData<PreOrderDetailResponse>(
        ["pre-order", id],
        (data) => (data ? { ...data, page: { ...data.page, isActive } } : data),
      );
    },
    onSettled: (_result, _error, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ["pre-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["pre-order", id] });
    },
  });
}

export function useDeletePreOrderPage() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(path(id), { method: "DELETE", token, schema: mobileOk }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["pre-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
