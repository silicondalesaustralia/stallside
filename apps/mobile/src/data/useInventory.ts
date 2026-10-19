import { useQuery } from "@tanstack/react-query";
import { inventoryResponse } from "@contracts/mobile/inventory";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

export function useInventory(standId: string | null, q: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["inventory", standId, q],
    enabled: Boolean(token && standId),
    queryFn: () => {
      const params = new URLSearchParams({ standId: standId ?? "" });
      if (q) params.set("q", q);
      return apiFetch(`/inventory?${params.toString()}`, { token, schema: inventoryResponse });
    },
  });
}
