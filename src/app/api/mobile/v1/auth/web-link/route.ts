import { webLinkBody, type WebLinkResponse } from "@/contracts/mobile/auth";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { createWebHandoff, safeHandoffPath } from "@/lib/mobile/web-handoff";
import { appBaseUrl } from "@/lib/app-url";
import { mobileError, mobileJson, mobileServerError, readMobileBody } from "@/lib/mobile/http";

/** One-time link that opens a dashboard page already signed in, so "Open on web" skips the login screen. */
export async function POST(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  const body = await readMobileBody(request, webLinkBody);
  if (!body.ok) return body.response;

  const next = safeHandoffPath(body.data.path);
  if (!next) return mobileError(400, "That page can't be opened from the app.");

  try {
    const token = await createWebHandoff(guard.value.user.id);
    const url = new URL("/api/mobile/v1/auth/web-handoff", appBaseUrl());
    url.searchParams.set("token", token);
    url.searchParams.set("next", next);
    return mobileJson<WebLinkResponse>({ url: url.toString() });
  } catch (error) {
    return mobileServerError("Mobile web link failed", error);
  }
}
