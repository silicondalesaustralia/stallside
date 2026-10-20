import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  paymentsResponse,
  type PaymentChoices,
} from "@contracts/mobile/payments";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

export function usePayments(standId: string | null) {
  const token = useToken();
  return useQuery({
    queryKey: ["payments", standId],
    enabled: Boolean(token && standId),
    queryFn: () =>
      apiFetch(`/payments?standId=${encodeURIComponent(standId ?? "")}`, {
        token,
        schema: paymentsResponse,
      }),
  });
}

export function useSavePayments(standId: string) {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (choices: PaymentChoices) =>
      apiFetch("/payments", {
        method: "PUT",
        token,
        body: { standId, choices },
        schema: paymentsResponse,
      }),
    onSuccess: (data) => queryClient.setQueryData(["payments", standId], data),
  });
}
