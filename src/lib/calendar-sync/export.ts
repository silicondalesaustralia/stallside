import type { CalendarConnection } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveStandTimezone } from "@/lib/stand-timezone";
import { activeAccessToken, calendarProviderClient, recordCalendarError } from "./connection";
import { exportWindow, loadExportCandidates } from "./exportEvents";
import { CalendarNotFoundError, type CalendarProviderClient } from "./types";

const EXPORT_CALENDAR_NAME = "Vendl";
/** Keeps one run inside a serverless time budget; the rest catch up next run. */
const MAX_WRITES_PER_RUN = 150;

async function ensureExportCalendar(
  conn: CalendarConnection,
  client: CalendarProviderClient,
  token: string,
  timeZone: string,
): Promise<string> {
  if (conn.exportCalendarId) return conn.exportCalendarId;
  const calendarId = await client.createExportCalendar(token, EXPORT_CALENDAR_NAME, timeZone);
  await prisma.$transaction([
    prisma.calendarExportLink.deleteMany({ where: { connectionId: conn.id } }),
    prisma.calendarConnection.update({ where: { id: conn.id }, data: { exportCalendarId: calendarId } }),
  ]);
  return calendarId;
}

async function syncConnection(conn: CalendarConnection, timeZone: string): Promise<void> {
  const client = calendarProviderClient(conn.provider);
  if (!client) return;
  const token = await activeAccessToken(conn);
  const calendarId = await ensureExportCalendar(conn, client, token, timeZone);
  const candidates = await loadExportCandidates(conn.ownerId, timeZone);
  const links = await prisma.calendarExportLink.findMany({ where: { connectionId: conn.id } });
  const linkById = new Map(links.map((l) => [l.vendlEventId, l]));
  let writes = 0;

  for (const c of candidates) {
    if (writes >= MAX_WRITES_PER_RUN) break;
    const link = linkById.get(c.vendlEventId);
    if (link?.fingerprint === c.fingerprint) continue;
    writes += 1;
    let externalEventId: string | null = null;
    if (link) {
      try {
        await client.updateEvent(token, calendarId, link.externalEventId, c.input);
        externalEventId = link.externalEventId;
      } catch (err) {
        if (!(err instanceof CalendarNotFoundError)) throw err;
      }
    }
    externalEventId ??= await client.createEvent(token, calendarId, c.input);
    await prisma.calendarExportLink.upsert({
      where: { connectionId_vendlEventId: { connectionId: conn.id, vendlEventId: c.vendlEventId } },
      create: {
        connectionId: conn.id,
        vendlEventId: c.vendlEventId,
        externalEventId,
        fingerprint: c.fingerprint,
        startsAt: c.startsAt,
      },
      update: { externalEventId, fingerprint: c.fingerprint, startsAt: c.startsAt },
    });
  }

  const live = new Set(candidates.map((c) => c.vendlEventId));
  const { start } = exportWindow();
  const stale = links.filter((l) => !live.has(l.vendlEventId) && l.startsAt >= start);
  for (const link of stale) {
    if (writes >= MAX_WRITES_PER_RUN) break;
    writes += 1;
    try {
      await client.deleteEvent(token, calendarId, link.externalEventId);
    } catch (err) {
      if (!(err instanceof CalendarNotFoundError)) throw err;
    }
    await prisma.calendarExportLink.delete({ where: { id: link.id } });
  }
}

/** Pushes the owner's Vendl schedule to every export-enabled calendar connection. */
export async function syncCalendarExports(ownerId: string): Promise<void> {
  const [owner, connections] = await Promise.all([
    prisma.owner.findUnique({ where: { id: ownerId }, select: { defaultTimezone: true } }),
    prisma.calendarConnection.findMany({ where: { ownerId, exportEnabled: true } }),
  ]);
  if (!owner) return;
  const timeZone = resolveStandTimezone(owner.defaultTimezone);

  for (const conn of connections) {
    try {
      await syncConnection(conn, timeZone);
      await prisma.calendarConnection.update({
        where: { id: conn.id },
        data: { lastSyncAt: new Date(), lastError: null },
      });
    } catch (err) {
      if (err instanceof CalendarNotFoundError && conn.exportCalendarId) {
        await prisma.calendarConnection.update({
          where: { id: conn.id },
          data: { exportCalendarId: null },
        });
      }
      console.error(`[calendar-sync] export failed for ${conn.provider}`, err);
      await recordCalendarError(conn.id, err);
    }
  }
}
