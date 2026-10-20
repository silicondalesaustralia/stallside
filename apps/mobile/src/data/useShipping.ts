import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  shippingResponse,
  type ShippingSettingsValues,
} from "@contracts/mobile/shipping";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

export function useShipping(standId: string | null) {
  const token = useToken();
  return useQuery({
    queryKey: ["shipping", standId],
    enabled: Boolean(token && standId),
    queryFn: () =>
      apiFetch(`/shipping?standId=${encodeURIComponent(standId ?? "")}`, {
        token,
        schema: shippingResponse,
      }),
  });
}

export function useSaveShipping(standId: string | null) {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: ShippingSettingsValues) =>
      apiFetch("/shipping", {
        method: "PUT",
        token,
        body: { standId, settings },
        schema: shippingResponse,
      }),
    onSuccess: (data) => queryClient.setQueryData(["shipping", standId], data),
  });
}
