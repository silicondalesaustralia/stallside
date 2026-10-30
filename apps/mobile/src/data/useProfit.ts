import { useQuery } from "@tanstack/react-query";
import { profitResponse, type ProfitRange } from "@contracts/mobile/profit";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

export function useProfit(standId: string | null, range: ProfitRange) {
  const token = useToken();
  return useQuery({
    queryKey: ["profit", standId, range],
    enabled: Boolean(token && standId),
    queryFn: () =>
      apiFetch(
        `/profit?${new URLSearchParams({ standId: standId ?? "", range }).toString()}`,
        { token, schema: profitResponse },
      ),
  });
}
