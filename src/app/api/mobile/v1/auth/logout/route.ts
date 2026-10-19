import { logoutBody } from "@/contracts/mobile/auth";
import type { MobileOk } from "@/contracts/mobile/common";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { revokeMobileSession } from "@/lib/mobile/session-token";
import { unregisterPushDevice } from "@/lib/push-devices";
import { mobileJson, mobileServerError, readMobileBody } from "@/lib/mobile/http";

/** Revokes this device's token and, if given, stops pushes to it. */
export async function POST(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  const body = await readMobileBody(request, logoutBody);
  if (!body.ok) return body.response;

  try {
    if (body.data.pushToken) {
      await unregisterPushDevice(guard.value.owner.id, body.data.pushToken);
    }
    await revokeMobileSession(guard.value.sessionId);
    return mobileJson<MobileOk>({ ok: true });
  } catch (error) {
    return mobileServerError("Mobile logout failed", error);
  }
}
