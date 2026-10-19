import type { MobileNotification } from "@/contracts/mobile/notifications";
import type { OwnerNotification } from "@/lib/notifications/service";

function metaString(metadata: unknown, key: string): string | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const value: unknown = Reflect.get(metadata, key);
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function toMobileNotification(notification: OwnerNotification): MobileNotification {
  const { metadata } = notification;
  return {
    id: notification.id,
    type: notification.type,
    status: notification.status,
    title: notification.title,
    message: notification.message,
    standName: notification.stand?.name ?? null,
    createdAt: notification.createdAt.toISOString(),
    orderId: metaString(metadata, "orderId"),
    productId: metaString(metadata, "productId"),
    email: metaString(metadata, "email"),
    setupPath: metaString(metadata, "setupPath"),
  };
}
