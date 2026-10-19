import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mobileOk } from "@contracts/mobile/common";
import { notificationsResponse, type MobileNotificationStatus } from "@contracts/mobile/notifications";
import { apiFetch } from "@/lib/api";
import { useToken } from "@/auth/useAuth";

const KEY = ["notifications"];

export function useNotifications() {
  const token = useToken();
  return useQuery({
    queryKey: KEY,
    enabled: Boolean(token),
    queryFn: () => apiFetch("/notifications", { token, schema: notificationsResponse }),
  });
}

function useRefresh() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: KEY });
}

const path = (id: string) => `/notifications/${encodeURIComponent(id)}`;

export function useSetNotificationStatus() {
  const token = useToken();
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (input: { id: string; status: MobileNotificationStatus }) =>
      apiFetch(path(input.id), { method: "PATCH", token, body: { status: input.status }, schema: mobileOk }),
    onSuccess: refresh,
  });
}

export function useDeleteNotification() {
  const token = useToken();
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (id: string) => apiFetch(path(id), { method: "DELETE", token, schema: mobileOk }),
    onSuccess: refresh,
  });
}

export function useCloseAllNotifications() {
  const token = useToken();
  const refresh = useRefresh();
  return useMutation({
    mutationFn: () => apiFetch("/notifications/close-all", { method: "POST", token, schema: mobileOk }),
    onSuccess: refresh,
  });
}
