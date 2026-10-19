import type { MobileOk } from "@/contracts/mobile/common";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { closeAllOwnerNotifications } from "@/lib/notifications/service";
import { mobileJson, mobileServerError } from "@/lib/mobile/http";

export async function POST(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  try {
    await closeAllOwnerNotifications(guard.value.owner.id);
    return mobileJson<MobileOk>({ ok: true });
  } catch (error) {
    return mobileServerError("Mobile close-all notifications failed", error);
  }
}
