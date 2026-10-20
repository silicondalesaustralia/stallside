import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mobileOk } from "@contracts/mobile/common";
import {
  supplierDetailResponse,
  suppliersResponse,
  type SupplierDetailResponse,
} from "@contracts/mobile/suppliers";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

const path = (id: string) => `/suppliers/${encodeURIComponent(id)}`;

export function useSuppliers(standId: string | null) {
  const token = useToken();
  return useQuery({
    queryKey: ["suppliers", standId],
    enabled: Boolean(token && standId),
    queryFn: () =>
      apiFetch(`/suppliers?standId=${encodeURIComponent(standId ?? "")}`, {
        token,
        schema: suppliersResponse,
      }),
  });
}

export function useSupplier(memberId: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["supplier", memberId],
    enabled: Boolean(token && memberId),
    queryFn: () =>
      apiFetch(path(memberId), { token, schema: supplierDetailResponse }),
  });
}

export function useInviteSupplier(standId: string) {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; email: string }) =>
      apiFetch("/suppliers", {
        method: "POST",
        token,
        body: { standId, ...input },
        schema: mobileOk,
      }),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ["suppliers"] }),
  });
}

type Change =
  | { kind: "payout"; amount: string; note: string }
  | { kind: "approve"; lotId: string }
  | { kind: "revoke" };

/** Payment, stock approval or revoke; the server returns the updated supplier. */
export function useSupplierChange(memberId: string) {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ kind, ...body }: Change) => {
      const schema = supplierDetailResponse;
      if (kind === "revoke") {
        return apiFetch(path(memberId), { method: "DELETE", token, schema });
      }
      const suffix = kind === "payout" ? "/payouts" : "/approve";
      return apiFetch(`${path(memberId)}${suffix}`, {
        method: "POST",
        token,
        body,
        schema,
      });
    },
    onSuccess: (data: SupplierDetailResponse) => {
      queryClient.setQueryData(["supplier", memberId], data);
      void queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
