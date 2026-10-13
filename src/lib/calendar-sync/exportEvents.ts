import { createHash } from "node:crypto";
import { loadCalendarEvents } from "@/lib/calendar/load";
import type { CalendarEvent, CalendarEventType } from "@/lib/calendar/types";
import { CALENDAR_TYPE_LABEL } from "@/lib/calendar/types";
import { hostPublicOrigin } from "@/lib/socialHost/hostConfig";
import type { ProviderEventInput } from "./types";

/** Customer-facing commitments worth having on a phone calendar. */
const EXPORT_TYPES: CalendarEventType[] = ["menu_close", "pickup", "delivery", "market", "custom_order"];

const PAST_DAYS = 1;
const FUTURE_DAYS = 60;

export type ExportCandidate = {
  vendlEventId: string;
  startsAt: Date;
  fingerprint: string;
  input: ProviderEventInput;
};

export function exportWindow(now = new Date()): { start: Date; end: Date } {
  const day = 24 * 60 * 60 * 1000;
  return {
    start: new Date(now.getTime() - PAST_DAYS * day),
    end: new Date(now.getTime() + FUTURE_DAYS * day),
  };
}

function toInput(e: CalendarEvent, timeZone: string): ProviderEventInput {
  const lines = [
    CALENDAR_TYPE_LABEL[e.type],
    e.summary,
    `Open in Vendl: ${hostPublicOrigin()}${e.href}`,
  ].filter(Boolean);
  return {
    title: e.title,
    description: lines.join("\n"),
    location: e.location,
    startsAt: e.startsAt,
    endsAt: e.endsAt,
    allDay: e.allDay,
    timeZone,
  };
}

function fingerprintOf(input: ProviderEventInput): string {
  return createHash("sha256")
    .update(
      JSON.stringify([
        input.title,
        input.description,
        input.location,
        input.startsAt.toISOString(),
        input.endsAt?.toISOString() ?? null,
        input.allDay,
        input.timeZone,
      ]),
    )
    .digest("base64url");
}

/** Vendl events (no external ones) the owner should see in their own calendar. */
export async function loadExportCandidates(
  ownerId: string,
  timeZone: string,
): Promise<ExportCandidate[]> {
  const { start, end } = exportWindow();
  const events = await loadCalendarEvents({ ownerId, start, end, timeZone, types: EXPORT_TYPES });
  return events.map((e) => {
    const input = toInput(e, timeZone);
    return { vendlEventId: e.id, startsAt: e.startsAt, fingerprint: fingerprintOf(input), input };
  });
}
