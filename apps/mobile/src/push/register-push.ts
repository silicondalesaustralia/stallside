import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { mobileOk } from "@contracts/mobile/common";
import { apiFetch } from "@/lib/api";
import { writeSecure } from "@/auth/secure-values";

const ORDERS_CHANNEL = "orders";

/**
 * Asks for permission and registers this device's native push token (APNs on iOS, FCM on
 * Android) — the same tokens the server's notify-push sender already handles.
 */
export async function registerForPush(sessionToken: string): Promise<string | null> {
  if (!Device.isDevice) return null;
  if (Platform.OS !== "ios" && Platform.OS !== "android") return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(ORDERS_CHANNEL, {
      name: "Orders and alerts",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  const status =
    existing.status === "granted"
      ? existing.status
      : (await Notifications.requestPermissionsAsync()).status;
  if (status !== "granted") return null;

  const device = await Notifications.getDevicePushTokenAsync();
  if (typeof device.data !== "string") return null;

  await apiFetch("/push/register", {
    method: "POST",
    token: sessionToken,
    body: { token: device.data, platform: Platform.OS },
    schema: mobileOk,
  });
  await writeSecure("pushToken", device.data);
  return device.data;
}
