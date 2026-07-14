"use client";

import { Capacitor } from "@capacitor/core";

let started = false;

export async function registerOwnerPush() {
  if (!Capacitor.isNativePlatform() || started) return;
  started = true;

  const { PushNotifications } = await import("@capacitor/push-notifications");

  let perm = await PushNotifications.checkPermissions();
  if (perm.receive === "prompt" || perm.receive === "prompt-with-rationale") {
    perm = await PushNotifications.requestPermissions();
  }
  if (perm.receive !== "granted") {
    started = false;
    return;
  }

  await PushNotifications.addListener("registration", (token) => {
    void fetch("/api/push/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: token.value,
        platform: Capacitor.getPlatform() === "ios" ? "ios" : "android",
      }),
    }).then(async (res) => {
      if (!res.ok) console.error("Push token register failed", await res.text());
    });
  });

  await PushNotifications.addListener("registrationError", (err) => {
    console.error("Push registration error", err);
  });

  await PushNotifications.register();
}
