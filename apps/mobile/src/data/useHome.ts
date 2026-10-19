import { useQuery } from "@tanstack/react-query";
import { homeResponse, type HomeRange } from "@contracts/mobile/home";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

const POLL_MS = 60_000;

export function useHome(standId: string | null, range: HomeRange) {
  const token = useToken();
  return useQuery({
    queryKey: ["home", standId, range],
    enabled: Boolean(token && standId),
    queryFn: () => {
      const params = new URLSearchParams({ standId: standId ?? "", range });
      return apiFetch(`/home?${params.toString()}`, { token, schema: homeResponse });
    },
    refetchInterval: POLL_MS,
  });
}
