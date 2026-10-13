import { cleanEnvSecret } from "@/lib/env";
import { hostPublicOrigin } from "@/lib/socialHost/hostConfig";

/**
 * Read the owner's events (import) and manage only calendars this app creates (export).
 * calendar.app.created cannot touch the owner's other calendars.
 */
export const GOOGLE_CALENDAR_SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/calendar.events.readonly",
  "https://www.googleapis.com/auth/calendar.app.created",
];

export const GOOGLE_CALENDAR_CALLBACK_PATH = "/api/calendar/connect/google/callback";

export type GoogleOAuthCredentials = { clientId: string; clientSecret: string };

export function googleOAuthCredentials(): GoogleOAuthCredentials | null {
  const clientId = cleanEnvSecret(process.env.GOOGLE_OAUTH_CLIENT_ID);
  const clientSecret = cleanEnvSecret(process.env.GOOGLE_OAUTH_CLIENT_SECRET);
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export function requireGoogleOAuthCredentials(): GoogleOAuthCredentials {
  const creds = googleOAuthCredentials();
  if (!creds) throw new Error("GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET are not set");
  return creds;
}

export function isGoogleCalendarConnectEnabled(): boolean {
  return process.env.GOOGLE_CALENDAR_CONNECT_ENABLED === "true" && googleOAuthCredentials() !== null;
}

/** Must exactly match an Authorised redirect URI on the Google OAuth client. */
export function googleCalendarRedirectUri(): string {
  return `${hostPublicOrigin()}${GOOGLE_CALENDAR_CALLBACK_PATH}`;
}
