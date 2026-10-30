import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  productionMessage,
  productionResponse,
  type RecordBatchBody,
} from "@contracts/mobile/production";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

export function useProduction(standId: string | null) {
  const token = useToken();
  return useQuery({
    queryKey: ["production", standId],
    enabled: Boolean(token && standId),
    queryFn: () =>
      apiFetch(
        `/production?${new URLSearchParams({ standId: standId ?? "" }).toString()}`,
        { token, schema: productionResponse },
      ),
  });
}

/** Batches change product stock, so product and inventory lists refresh too. */
function useInvalidateStock() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all(
      ["production", "products", "product", "inventory", "home"].map((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      ),
    );
}

export function useRecordBatch() {
  const token = useToken();
  const invalidate = useInvalidateStock();
  return useMutation({
    mutationFn: (body: RecordBatchBody) =>
      apiFetch("/production", {
        method: "POST",
        token,
        body,
        schema: productionMessage,
      }),
    onSuccess: invalidate,
  });
}

export function useUndoBatch() {
  const token = useToken();
  const invalidate = useInvalidateStock();
  return useMutation({
    mutationFn: (batchId: string) =>
      apiFetch(`/production/${encodeURIComponent(batchId)}`, {
        method: "DELETE",
        token,
        schema: productionMessage,
      }),
    onSuccess: invalidate,
  });
}
