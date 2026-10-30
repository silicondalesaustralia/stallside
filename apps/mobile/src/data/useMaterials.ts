import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  materialDetailResponse,
  materialsMessage,
  materialsResponse,
  type PurchaseBody,
} from "@contracts/mobile/materials";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

function standQuery(standId: string | null): string {
  return new URLSearchParams({ standId: standId ?? "" }).toString();
}

export function useMaterials(standId: string | null) {
  const token = useToken();
  return useQuery({
    queryKey: ["materials", standId],
    enabled: Boolean(token && standId),
    queryFn: () =>
      apiFetch(`/materials?${standQuery(standId)}`, {
        token,
        schema: materialsResponse,
      }),
  });
}

export function useMaterial(standId: string | null, ingredientId: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["material", standId, ingredientId],
    enabled: Boolean(token && standId && ingredientId),
    queryFn: () =>
      apiFetch(
        `/materials/${encodeURIComponent(ingredientId)}?${standQuery(standId)}`,
        { token, schema: materialDetailResponse },
      ),
  });
}

/** Purchases change stock and costs, so materials, recipes' batch costs and the batch form refresh. */
export function useInvalidateMaterials() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all(
      ["materials", "material", "production"].map((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      ),
    );
}

export function useRecordPurchase() {
  const token = useToken();
  const invalidate = useInvalidateMaterials();
  return useMutation({
    mutationFn: (body: PurchaseBody) =>
      apiFetch("/materials/purchases", {
        method: "POST",
        token,
        body,
        schema: materialsMessage,
      }),
    onSuccess: invalidate,
  });
}

export function useRemovePurchase() {
  const token = useToken();
  const invalidate = useInvalidateMaterials();
  return useMutation({
    mutationFn: (purchaseId: string) =>
      apiFetch(`/materials/purchases/${encodeURIComponent(purchaseId)}`, {
        method: "DELETE",
        token,
        schema: materialsMessage,
      }),
    onSuccess: invalidate,
  });
}
