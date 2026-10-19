import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { useQueryClient } from "@tanstack/react-query";
import { registerForPush } from "@/push/register-push";
import { openNotification } from "@/push/open-notification";

/** Registers for push once signed in; alerts refresh data, taps (including cold starts) open the related screen. */
export function usePushRegistration(sessionToken: string | null) {
  const queryClient = useQueryClient();
  const lastResponse = Notifications.useLastNotificationResponse();
  const handledId = useRef<string | null>(null);

  useEffect(() => {
    if (!sessionToken) return;
    registerForPush(sessionToken).catch((error: unknown) => {
      console.warn("Push registration failed", error);
    });
  }, [sessionToken]);

  useEffect(() => {
    const received = Notifications.addNotificationReceivedListener(() => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({ queryKey: ["home"] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });
    return () => received.remove();
  }, [queryClient]);

  useEffect(() => {
    if (!sessionToken || !lastResponse) return;
    const id = lastResponse.notification.request.identifier;
    if (handledId.current === id) return;
    handledId.current = id;
    void queryClient.invalidateQueries();
    openNotification(lastResponse.notification.request.content.data ?? {});
  }, [lastResponse, queryClient, sessionToken]);
}
