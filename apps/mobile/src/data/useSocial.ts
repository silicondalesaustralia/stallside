import { useQuery } from "@tanstack/react-query";
import { socialResponse } from "@contracts/mobile/social";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

export function useSocial(standId: string | null) {
  const token = useToken();
  return useQuery({
    queryKey: ["social", standId],
    enabled: Boolean(token && standId),
    queryFn: () =>
      apiFetch(
        `/social?${new URLSearchParams({ standId: standId ?? "" }).toString()}`,
        { token, schema: socialResponse },
      ),
  });
}
