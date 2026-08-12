"use client";

import { useEffect, useState } from "react";
import EnablePushBanner from "@/components/EnablePushBanner";
import {
  isInstalledWebApp,
  isIosSafari,
  registerOwnerWebPush,
} from "@/lib/register-owner-web-push";

type OwnerPushRegisterProps = {
  pushAlertsEnabled: boolean;
};

export default function OwnerPushRegister({
  pushAlertsEnabled,
}: OwnerPushRegisterProps) {
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    if (!pushAlertsEnabled) return;

    let cancelled = false;

    void (async () => {
      const { Capacitor } = await import("@capacitor/core");
      if (Capacitor.isNativePlatform()) {
        const { registerOwnerPush } = await import("@/lib/register-owner-push");
        if (!cancelled) void registerOwnerPush();
        return;
      }

      const ios = isIosSafari();
      const installed = isInstalledWebApp();
      if (ios && !installed) {
        if (!cancelled) {
          setBanner(
            "Add Vendl to your Home Screen, open it from that icon, then tap Enable phone alerts.",
          );
        }
        return;
      }

      const permission =
        typeof Notification === "undefined"
          ? "default"
          : Notification.permission;
      if (permission === "denied") {
        if (!cancelled) {
          setBanner(
            "Notifications are blocked. On iPhone: Settings → Vendl.app → Notifications → Allow, then tap Enable.",
          );
        }
        return;
      }
      if (ios && permission !== "granted") {
        if (!cancelled) {
          setBanner("Tap Enable phone alerts so sales ping this phone.");
        }
        return;
      }

      const result = await registerOwnerWebPush();
      if (cancelled) return;
      if ("error" in result) {
        console.warn("[Vendl] web push register:", result.error);
        setBanner("Tap Enable phone alerts so sales ping this phone.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pushAlertsEnabled]);

  if (!pushAlertsEnabled || !banner) return null;

  return <EnablePushBanner hint={banner} onDone={() => setBanner(null)} />;
}
