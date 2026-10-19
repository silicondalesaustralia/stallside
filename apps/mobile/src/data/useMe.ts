import { useQuery } from "@tanstack/react-query";
import { meResponse } from "@contracts/mobile/me";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

export const ME_QUERY_KEY = ["me"] as const;

export function useMe() {
  const token = useToken();
  return useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: () => apiFetch("/me", { token, schema: meResponse }),
    enabled: Boolean(token),
  });
}
