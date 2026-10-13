import {
  GOOGLE_CALENDAR_SCOPES,
  googleCalendarRedirectUri,
  requireGoogleOAuthCredentials,
} from "./config";
import { CalendarAuthError, type ProviderTokenSet } from "../types";

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const REVOKE_URL = "https://oauth2.googleapis.com/revoke";

type GoogleTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  error_description?: string;
};

export function googleCalendarAuthUrl(state: string): string {
  const { clientId } = requireGoogleOAuthCredentials();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: googleCalendarRedirectUri(),
    response_type: "code",
    scope: GOOGLE_CALENDAR_SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

async function postToken(body: Record<string, string>): Promise<ProviderTokenSet> {
  const { clientId, clientSecret } = requireGoogleOAuthCredentials();
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ ...body, client_id: clientId, client_secret: clientSecret }),
    cache: "no-store",
  });
  const text = await res.text();
  let data: GoogleTokenResponse = {};
  try {
    data = JSON.parse(text) as GoogleTokenResponse;
  } catch {
    throw new Error(`Google token endpoint returned non-JSON (${res.status})`);
  }
  if (!res.ok || !data.access_token) {
    if (data.error === "invalid_grant") throw new CalendarAuthError("Google access was revoked");
    throw new Error(`Google token request failed: ${data.error_description ?? data.error ?? res.status}`);
  }
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? null,
    expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null,
    scopes: data.scope ? data.scope.split(" ") : [],
  };
}

export function exchangeGoogleCalendarCode(code: string): Promise<ProviderTokenSet> {
  return postToken({
    code,
    grant_type: "authorization_code",
    redirect_uri: googleCalendarRedirectUri(),
  });
}

export function refreshGoogleAccessToken(refreshToken: string): Promise<ProviderTokenSet> {
  return postToken({ refresh_token: refreshToken, grant_type: "refresh_token" });
}

/** Best-effort: revoking also invalidates the paired refresh token. */
export async function revokeGoogleToken(token: string): Promise<void> {
  try {
    const res = await fetch(REVOKE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token }),
      cache: "no-store",
    });
    if (!res.ok && res.status !== 400) {
      console.error(`[google-calendar] token revoke failed (${res.status})`);
    }
  } catch (err) {
    console.error("[google-calendar] token revoke failed", err);
  }
}

/** Email of the Google account that granted access (shown on the connection card). */
export async function fetchGoogleAccountEmail(accessToken: string): Promise<string | null> {
  try {
    const res = await fetch(USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { email?: unknown };
    return typeof data.email === "string" ? data.email : null;
  } catch (err) {
    console.error("[google-calendar] userinfo lookup failed", err);
    return null;
  }
}
