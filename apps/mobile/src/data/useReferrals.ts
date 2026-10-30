import { useQuery } from "@tanstack/react-query";
import { referralsResponse } from "@contracts/mobile/referrals";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

export function useReferrals() {
  const token = useToken();
  return useQuery({
    queryKey: ["referrals"],
    enabled: Boolean(token),
    queryFn: () => apiFetch("/referrals", { token, schema: referralsResponse }),
  });
}
