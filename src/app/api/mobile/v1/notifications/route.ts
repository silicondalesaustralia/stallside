import type { NotificationsResponse } from "@/contracts/mobile/notifications";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { countOpenNotifications, listOwnerNotifications } from "@/lib/notifications/service";
import { toMobileNotification } from "@/lib/mobile/notification-dto";
import { mobileJson, mobileServerError } from "@/lib/mobile/http";

export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  try {
    const ownerId = guard.value.owner.id;
    const [notifications, openCount] = await Promise.all([
      listOwnerNotifications(ownerId),
      countOpenNotifications(ownerId),
    ]);
    return mobileJson<NotificationsResponse>({
      openCount,
      notifications: notifications.map(toMobileNotification),
    });
  } catch (error) {
    return mobileServerError("Mobile notifications failed", error);
  }
}
