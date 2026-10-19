import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mobileOk } from "@contracts/mobile/common";
import { customerDetail, customersResponse } from "@contracts/mobile/customers";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

export function useCustomers(q: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["customers", q],
    enabled: Boolean(token),
    queryFn: () => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      return apiFetch(`/customers?${params.toString()}`, { token, schema: customersResponse });
    },
  });
}

export function useCustomer(customerId: string | undefined) {
  const token = useToken();
  return useQuery({
    queryKey: ["customer", customerId],
    enabled: Boolean(token && customerId),
    queryFn: () =>
      apiFetch(`/customers/${encodeURIComponent(customerId ?? "")}`, { token, schema: customerDetail }),
  });
}

export function useSaveCustomerNotes(customerId: string) {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notes: string) =>
      apiFetch(`/customers/${encodeURIComponent(customerId)}`, {
        method: "PATCH",
        token,
        body: { notes },
        schema: mobileOk,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customer", customerId] }),
  });
}
