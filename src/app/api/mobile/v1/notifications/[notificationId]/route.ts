import type { NextRequest } from "next/server";
import type { MobileOk } from "@/contracts/mobile/common";
import { notificationStatusBody } from "@/contracts/mobile/notifications";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { deleteOwnerNotification, setOwnerNotificationStatus } from "@/lib/notifications/service";
import { mobileError, mobileJson, mobileServerError, readMobileBody } from "@/lib/mobile/http";

type Ctx = RouteContext<"/api/mobile/v1/notifications/[notificationId]">;

/** Open / actioned / closed, same as the web inbox buttons. */
export async function PATCH(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  const body = await readMobileBody(request, notificationStatusBody);
  if (!body.ok) return body.response;

  try {
    const { notificationId } = await ctx.params;
    const found = await setOwnerNotificationStatus(guard.value.owner.id, notificationId, body.data.status);
    if (!found) return mobileError(404, "Notification not found.");
    return mobileJson<MobileOk>({ ok: true });
  } catch (error) {
    return mobileServerError("Mobile notification status failed", error);
  }
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  try {
    const { notificationId } = await ctx.params;
    const found = await deleteOwnerNotification(guard.value.owner.id, notificationId);
    if (!found) return mobileError(404, "Notification not found.");
    return mobileJson<MobileOk>({ ok: true });
  } catch (error) {
    return mobileServerError("Mobile notification delete failed", error);
  }
}
