import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accountResponse } from "@contracts/mobile/account";
import { mobileOk } from "@contracts/mobile/common";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

export function useAccount() {
  const token = useToken();
  return useQuery({
    queryKey: ["account"],
    enabled: Boolean(token),
    queryFn: () => apiFetch("/account", { token, schema: accountResponse }),
  });
}

export function useUpdateBusinessName() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (businessName: string) =>
      apiFetch("/account", {
        method: "PATCH",
        token,
        body: { businessName },
        schema: accountResponse,
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(["account"], data);
      void queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

/** Closes the account on the server; the caller signs the phone out afterwards. */
export function useDeleteAccount() {
  const token = useToken();
  return useMutation({
    mutationFn: () =>
      apiFetch("/account", { method: "DELETE", token, schema: mobileOk }),
  });
}
