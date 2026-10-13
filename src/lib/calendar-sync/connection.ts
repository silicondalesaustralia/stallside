import type { CalendarConnection, CalendarProvider } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { decryptSecret, encryptSecret } from "@/lib/square/crypto";
import { googleCalendarClient } from "./google/client";
import { CalendarAuthError, type CalendarProviderClient } from "./types";

const REFRESH_SKEW_MS = 2 * 60 * 1000;

export const RECONNECT_NEEDED = "Access was revoked. Reconnect to resume syncing.";

export function calendarProviderClient(provider: CalendarProvider): CalendarProviderClient | null {
  if (provider === "GOOGLE") return googleCalendarClient;
  return null;
}

export function listCalendarConnections(ownerId: string): Promise<CalendarConnection[]> {
  return prisma.calendarConnection.findMany({ where: { ownerId } });
}

/** Records a sync failure on the connection (shown on the Connections card). */
export async function recordCalendarError(connectionId: string, err: unknown): Promise<void> {
  const message = err instanceof CalendarAuthError
    ? RECONNECT_NEEDED
    : err instanceof Error
      ? err.message.slice(0, 500)
      : "Calendar sync failed";
  try {
    await prisma.calendarConnection.update({
      where: { id: connectionId },
      data: { lastError: message },
    });
  } catch (updateErr) {
    console.error("[calendar-sync] could not record error", updateErr);
  }
}

/** Returns a usable access token, refreshing (and persisting) it when close to expiry. */
export async function activeAccessToken(conn: CalendarConnection): Promise<string> {
  const fresh = conn.tokenExpiresAt && conn.tokenExpiresAt.getTime() - Date.now() > REFRESH_SKEW_MS;
  if (fresh || !conn.refreshTokenEnc) return decryptSecret(conn.accessTokenEnc);

  const client = calendarProviderClient(conn.provider);
  if (!client) throw new Error(`No calendar client for ${conn.provider}`);
  const tokens = await client.refreshAccessToken(decryptSecret(conn.refreshTokenEnc));
  await prisma.calendarConnection.update({
    where: { id: conn.id },
    data: {
      accessTokenEnc: encryptSecret(tokens.accessToken),
      ...(tokens.refreshToken ? { refreshTokenEnc: encryptSecret(tokens.refreshToken) } : {}),
      tokenExpiresAt: tokens.expiresAt,
    },
  });
  return tokens.accessToken;
}
