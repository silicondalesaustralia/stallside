import type { MobileOk } from "@/contracts/mobile/common";
import { pushRegisterBody, pushUnregisterBody } from "@/contracts/mobile/push";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { registerPushDevice, unregisterPushDevice } from "@/lib/push-devices";
import { mobileJson, mobileServerError, readMobileBody } from "@/lib/mobile/http";

/** iOS sends its APNs device token, Android its FCM token. */
export async function POST(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  const body = await readMobileBody(request, pushRegisterBody);
  if (!body.ok) return body.response;

  try {
    await registerPushDevice(guard.value.owner.id, body.data.token, body.data.platform);
    return mobileJson<MobileOk>({ ok: true });
  } catch (error) {
    return mobileServerError("Mobile push register failed", error);
  }
}

export async function DELETE(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  const body = await readMobileBody(request, pushUnregisterBody);
  if (!body.ok) return body.response;

  try {
    await unregisterPushDevice(guard.value.owner.id, body.data.token);
    return mobileJson<MobileOk>({ ok: true });
  } catch (error) {
    return mobileServerError("Mobile push unregister failed", error);
  }
}
