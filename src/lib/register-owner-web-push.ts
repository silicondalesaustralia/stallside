"use client";

import { Capacitor } from "@capacitor/core";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

function webPushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

async function getRegistration() {
  return navigator.serviceWorker.register("/sw.js");
}

export async function registerOwnerWebPush(): Promise<{ ok: true } | { error: string }> {
  if (Capacitor.isNativePlatform()) {
    return { ok: true };
  }
  if (!webPushSupported()) {
    return { error: "Push is not supported in this browser." };
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) {
    return { error: "Push is not configured on this server yet." };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { error: "Notification permission was denied." };
  }

  try {
    const registration = await getRegistration();
    await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }

    const res = await fetch("/api/push/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: JSON.stringify(subscription.toJSON()),
        platform: "web",
      }),
    });
    if (!res.ok) {
      return { error: "Could not save this device for push." };
    }
    return { ok: true };
  } catch (error) {
    console.error("Web push register failed", error);
    return { error: "Could not enable phone push." };
  }
}

export async function unregisterOwnerWebPush(): Promise<void> {
  if (Capacitor.isNativePlatform() || !webPushSupported()) return;

  try {
    const registration = await navigator.serviceWorker.getRegistration("/sw.js");
    const subscription = await registration?.pushManager.getSubscription();
    if (!subscription) return;

    const token = JSON.stringify(subscription.toJSON());
    await subscription.unsubscribe();
    await fetch("/api/push/register", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
  } catch (error) {
    console.error("Web push unregister failed", error);
  }
}

export function isInstalledWebApp() {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  if (nav.standalone) return true;
  return window.matchMedia("(display-mode: standalone)").matches;
}

export function isIosSafari() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const webkit = /WebKit/.test(ua);
  const chromium = /CriOS|FxiOS|EdgiOS/.test(ua);
  return iOS && webkit && !chromium;
}
