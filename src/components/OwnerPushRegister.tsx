"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { registerOwnerPush } from "@/lib/register-owner-push";
import { registerOwnerWebPush } from "@/lib/register-owner-web-push";

type OwnerPushRegisterProps = {
  pushAlertsEnabled: boolean;
};

export default function OwnerPushRegister({
  pushAlertsEnabled,
}: OwnerPushRegisterProps) {
  useEffect(() => {
    if (!pushAlertsEnabled) return;

    if (Capacitor.isNativePlatform()) {
      void registerOwnerPush();
      return;
    }

    void registerOwnerWebPush().then((result) => {
      if ("error" in result) {
        console.warn("[Stallside] web push register:", result.error);
      }
    });
  }, [pushAlertsEnabled]);

  return null;
}
