import { useQuery } from "@tanstack/react-query";
import {
  qrCodesResponse,
  qrImageResponse,
  type QrKind,
} from "@contracts/mobile/qr";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

export function useQrCodes() {
  const token = useToken();
  return useQuery({
    queryKey: ["qr-codes"],
    enabled: Boolean(token),
    queryFn: () => apiFetch("/qr", { token, schema: qrCodesResponse }),
  });
}

export function useQrImage(kind: QrKind, id: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["qr-image", kind, id],
    enabled: Boolean(token && id),
    staleTime: 10 * 60 * 1000,
    queryFn: () =>
      apiFetch(`/qr/${kind}/${encodeURIComponent(id)}`, {
        token,
        schema: qrImageResponse,
      }),
  });
}
