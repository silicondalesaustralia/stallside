import { alertSettingsBody, type AlertSettings } from "@/contracts/mobile/notifications";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { getOwnerAlertSettings, updateOwnerAlertSettings } from "@/lib/alerts/settings";
import { mobileJson, mobileServerError, readMobileBody } from "@/lib/mobile/http";

async function respond(ownerId: string) {
  const settings = await getOwnerAlertSettings(ownerId);
  return mobileJson<AlertSettings>({
    emailAlertsEnabled: settings.emailAlertsEnabled,
    pushAlertsEnabled: settings.pushAlertsEnabled,
    contactEmail: settings.contactEmail,
    appDevices: settings.appDevices,
  });
}

export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  try {
    return await respond(guard.value.owner.id);
  } catch (error) {
    return mobileServerError("Mobile alert settings failed", error);
  }
}

/** Phone and email alert switches; the same owner settings the web uses. */
export async function PATCH(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  const body = await readMobileBody(request, alertSettingsBody);
  if (!body.ok) return body.response;

  try {
    await updateOwnerAlertSettings(guard.value.owner.id, body.data);
    return await respond(guard.value.owner.id);
  } catch (error) {
    return mobileServerError("Mobile alert settings update failed", error);
  }
}
