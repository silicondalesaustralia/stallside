import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  taxSettingsResponse,
  taxSyncResponse,
  type TaxSettingsBody,
} from "@contracts/mobile/tax";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

const KEY = ["tax-settings"] as const;

export function useTaxSettings() {
  const token = useToken();
  return useQuery({
    queryKey: KEY,
    enabled: Boolean(token),
    queryFn: () =>
      apiFetch("/settings/tax", { token, schema: taxSettingsResponse }),
  });
}

export function useSaveTaxSettings() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: TaxSettingsBody) =>
      apiFetch("/settings/tax", {
        method: "PUT",
        token,
        body,
        schema: taxSettingsResponse,
      }),
    onSuccess: async (data) => {
      queryClient.setQueryData(KEY, data);
      await queryClient.invalidateQueries({ queryKey: ["profit"] });
    },
  });
}

export function useSyncPastOrderTax() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch("/settings/tax/sync", {
        method: "POST",
        token,
        schema: taxSyncResponse,
      }),
    onSuccess: () =>
      Promise.all(
        ["orders", "order", "profit", "home"].map((key) =>
          queryClient.invalidateQueries({ queryKey: [key] }),
        ),
      ),
  });
}
