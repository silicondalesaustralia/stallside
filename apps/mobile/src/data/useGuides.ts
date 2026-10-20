import { useQuery } from "@tanstack/react-query";
import { guideResponse, guidesResponse } from "@contracts/mobile/guides";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

export function useGuides() {
  const token = useToken();
  return useQuery({
    queryKey: ["guides"],
    enabled: Boolean(token),
    staleTime: 60 * 60 * 1000,
    queryFn: () => apiFetch("/guides", { token, schema: guidesResponse }),
  });
}

export function useGuide(slug: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["guide", slug],
    enabled: Boolean(token && slug),
    staleTime: 60 * 60 * 1000,
    queryFn: () =>
      apiFetch(`/guides/${encodeURIComponent(slug)}`, {
        token,
        schema: guideResponse,
      }),
  });
}
