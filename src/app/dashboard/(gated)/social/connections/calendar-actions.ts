"use server";

import { revalidatePath } from "next/cache";
import type { CalendarProvider } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOwner, requireOwnerWrite } from "@/lib/session";
import { decryptSecret } from "@/lib/square/crypto";
import { isGoogleCalendarConnectEnabled } from "@/lib/calendar-sync/google/config";
import { revokeGoogleToken } from "@/lib/calendar-sync/google/oauth";
import { syncCalendarExports } from "@/lib/calendar-sync/export";

export type CalendarConnectionStatus = {
  provider: CalendarProvider;
  accountEmail: string | null;
  lastSyncAt: string | null;
  lastError: string | null;
};

export type CalendarConnectionsState = {
  googleEnabled: boolean;
  connections: CalendarConnectionStatus[];
};

async function readState(ownerId: string): Promise<CalendarConnectionsState> {
  const rows = await prisma.calendarConnection.findMany({
    where: { ownerId },
    select: { provider: true, accountEmail: true, lastSyncAt: true, lastError: true },
  });
  return {
    googleEnabled: isGoogleCalendarConnectEnabled(),
    connections: rows.map((r) => ({
      provider: r.provider,
      accountEmail: r.accountEmail,
      lastSyncAt: r.lastSyncAt?.toISOString() ?? null,
      lastError: r.lastError,
    })),
  };
}

export async function loadCalendarConnectionsAction(): Promise<CalendarConnectionsState> {
  const { owner } = await requireOwner();
  return readState(owner.id);
}

export async function syncCalendarNowAction(): Promise<CalendarConnectionsState> {
  const { owner } = await requireOwnerWrite();
  await syncCalendarExports(owner.id);
  return readState(owner.id);
}

export async function disconnectCalendarAction(
  provider: CalendarProvider,
): Promise<CalendarConnectionsState> {
  const { owner } = await requireOwnerWrite();
  const conn = await prisma.calendarConnection.findUnique({
    where: { ownerId_provider: { ownerId: owner.id, provider } },
    select: { id: true, accessTokenEnc: true, refreshTokenEnc: true },
  });
  if (conn) {
    if (provider === "GOOGLE") {
      try {
        await revokeGoogleToken(decryptSecret(conn.refreshTokenEnc ?? conn.accessTokenEnc));
      } catch (err) {
        console.error("[calendar] could not decrypt token for revoke", err);
      }
    }
    await prisma.calendarConnection.delete({ where: { id: conn.id } });
  }
  revalidatePath("/dashboard/calendar");
  return readState(owner.id);
}
