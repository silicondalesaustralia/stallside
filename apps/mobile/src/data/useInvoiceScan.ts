import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  invoiceScanResponse,
  type InvoiceScanResponse,
  type SaveInvoiceBody,
} from "@contracts/mobile/invoice-scan";
import { materialsMessage } from "@contracts/mobile/materials";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";
import type { PickedPhoto } from "@/lib/pick-photo";
import { useInvalidateMaterials } from "@/data/useMaterials";

const SCAN_KEY = ["invoice-scan"] as const;

/** Uploads an invoice photo; the result waits in the cache for the review screen. */
export function useScanInvoice(standId: string | null) {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (photo: PickedPhoto) => {
      const body = new FormData();
      body.append("file", photo);
      return apiFetch(
        `/materials/scan?${new URLSearchParams({ standId: standId ?? "" }).toString()}`,
        { method: "POST", token, body, schema: invoiceScanResponse },
      );
    },
    onSuccess: (result) => queryClient.setQueryData(SCAN_KEY, result),
  });
}

/** The last scan, kept until it's saved or replaced. Never refetched. */
export function useScannedInvoice() {
  return useQuery<InvoiceScanResponse | null>({
    queryKey: SCAN_KEY,
    queryFn: () => null,
    enabled: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useSaveInvoice() {
  const token = useToken();
  const queryClient = useQueryClient();
  const invalidate = useInvalidateMaterials();
  return useMutation({
    mutationFn: (body: SaveInvoiceBody) =>
      apiFetch("/materials/scan/save", {
        method: "POST",
        token,
        body,
        schema: materialsMessage,
      }),
    onSuccess: async () => {
      queryClient.setQueryData(SCAN_KEY, null);
      await invalidate();
    },
  });
}
