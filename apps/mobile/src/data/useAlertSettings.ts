import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { alertSettings, type AlertSettingsBody } from "@contracts/mobile/notifications";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

const KEY = ["alert-settings"];

export function useAlertSettings() {
  const token = useToken();
  return useQuery({
    queryKey: KEY,
    enabled: Boolean(token),
    queryFn: () => apiFetch("/settings/alerts", { token, schema: alertSettings }),
  });
}

export function useSaveAlertSettings() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AlertSettingsBody) =>
      apiFetch("/settings/alerts", { method: "PATCH", token, body, schema: alertSettings }),
    onSuccess: (settings) => queryClient.setQueryData(KEY, settings),
  });
}
