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

async function fetchVapidPublicKey(): Promise<string | { error: string }> {
  const fromEnv = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  if (fromEnv) return fromEnv;

  try {
    const res = await fetch("/api/push/vapid");
    if (!res.ok) {
      return { error: "Push is not configured on this server yet." };
    }
    const data: unknown = await res.json();
    if (
      !data ||
      typeof data !== "object" ||
      !("publicKey" in data) ||
      typeof (data as { publicKey: unknown }).publicKey !== "string"
    ) {
      return { error: "Push is not configured on this server yet." };
    }
    return (data as { publicKey: string }).publicKey;
  } catch {
    return { error: "Could not load push configuration." };
  }
}

export async function registerOwnerWebPush(): Promise<{ ok: true } | { error: string }> {
  if (Capacitor.isNativePlatform()) {
    return {
      error:
        "Open Stallside from the Home Screen Safari icon for phone push (not the native app shell).",
    };
  }
  if (!webPushSupported()) {
    return { error: "Push is not supported in this browser." };
  }
  if (isIosSafari() && !isInstalledWebApp()) {
    return {
      error:
        "On iPhone, open Stallside from the Home Screen icon first, then enable push.",
    };
  }

  const publicKey = await fetchVapidPublicKey();
  if (typeof publicKey !== "string") return publicKey;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { error: "Notification permission was denied." };
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
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
    const message = error instanceof Error ? error.message : "";
    if (/denied|not allowed|user gesture/i.test(message)) {
      return { error: "Notification permission was denied." };
    }
    return { error: "Could not enable phone push. Try again from the Home Screen icon." };
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
