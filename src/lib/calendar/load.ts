import { resolveStandTimezone } from "@/lib/stand-timezone";
import { dedupeCalendarEvents, filterCalendarTypes } from "./dedupe";
import { projectCustomOrderEvents } from "./project-custom";
import { projectMarketEvents } from "./project-events";
import { projectMenuEvents } from "./project-menus";
import { projectOrderFulfilmentEvents } from "./project-orders";
import { projectProductionEvents } from "./project-production";
import { projectFulfilmentWindowEvents } from "./project-windows";
import type { CalendarEvent, CalendarEventType } from "./types";

export type LoadCalendarInput = {
  ownerId: string;
  start: Date;
  end: Date;
  timeZone?: string;
  standId?: string | null;
  types?: CalendarEventType[] | null;
};

export async function loadCalendarEvents(
  input: LoadCalendarInput,
): Promise<CalendarEvent[]> {
  const timeZone = resolveStandTimezone(input.timeZone);
  const base = {
    ownerId: input.ownerId,
    start: input.start,
    end: input.end,
    timeZone,
    standId: input.standId,
  };

  const [menus, production, orders, windows, markets, custom] = await Promise.all([
    projectMenuEvents(base),
    projectProductionEvents(base),
    projectOrderFulfilmentEvents(base),
    projectFulfilmentWindowEvents(base),
    projectMarketEvents(base),
    projectCustomOrderEvents(base),
  ]);

  const merged = dedupeCalendarEvents([
    ...menus,
    ...production,
    ...windows,
    ...orders,
    ...markets,
    ...custom,
  ]);

  return filterCalendarTypes(merged, input.types ?? null);
}

/** Next few headline items for Operate home (no duplicate queries logic). */
export async function loadComingUpSummary(input: {
  ownerId: string;
  timeZone: string;
  limit?: number;
}): Promise<{ lines: string[]; eventCount: number }> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  const events = await loadCalendarEvents({
    ownerId: input.ownerId,
    start,
    end,
    timeZone: input.timeZone,
  });

  const lines = events.slice(0, input.limit ?? 4).map((e) => {
    const day = e.dayKey;
    return `${day} — ${e.title}${e.summary ? ` · ${e.summary}` : ""}`;
  });

  return { lines, eventCount: events.length };
}
