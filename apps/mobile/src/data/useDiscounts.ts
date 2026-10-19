import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mobileOk } from "@contracts/mobile/common";
import {
  discountDetail,
  discountSaveResponse,
  discountsResponse,
  type DiscountInputValues,
  type DiscountsResponse,
} from "@contracts/mobile/discounts";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

const path = (id: string) => `/discounts/${encodeURIComponent(id)}`;

export function useDiscounts(standId: string | null) {
  const token = useToken();
  return useQuery({
    queryKey: ["discounts", standId],
    enabled: Boolean(token && standId),
    queryFn: () =>
      apiFetch(`/discounts?standId=${encodeURIComponent(standId ?? "")}`, { token, schema: discountsResponse }),
  });
}

export function useDiscount(discountId: string | null) {
  const token = useToken();
  return useQuery({
    queryKey: ["discount", discountId],
    enabled: Boolean(token && discountId),
    queryFn: () => apiFetch(path(discountId ?? ""), { token, schema: discountDetail }),
  });
}

/** Creates when there's no id yet (needs the business), otherwise updates. */
export function useSaveDiscount(discountId: string | null, standId: string | null) {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DiscountInputValues) =>
      discountId
        ? apiFetch(path(discountId), { method: "PUT", token, body: { input }, schema: discountSaveResponse })
        : apiFetch("/discounts", { method: "POST", token, body: { standId, input }, schema: discountSaveResponse }),
    onSuccess: ({ id }) => {
      void queryClient.invalidateQueries({ queryKey: ["discounts"] });
      void queryClient.invalidateQueries({ queryKey: ["discount", id] });
    },
  });
}

export function useSetDiscountActive() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiFetch(path(id), { method: "PATCH", token, body: { isActive }, schema: mobileOk }),
    onMutate: ({ id, isActive }) => {
      queryClient.setQueriesData<DiscountsResponse>({ queryKey: ["discounts"] }, (data) =>
        data ? { discounts: data.discounts.map((d) => (d.id === id ? { ...d, isActive } : d)) } : data,
      );
    },
    onSettled: (_result, _error, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ["discounts"] });
      void queryClient.invalidateQueries({ queryKey: ["discount", id] });
    },
  });
}

export function useDeleteDiscount() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(path(id), { method: "DELETE", token, schema: mobileOk }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["discounts"] }),
  });
}
