import type { CalendarEvent } from "./types";

/** Stable sort + drop exact duplicate ids. */
export function dedupeCalendarEvents(events: CalendarEvent[]): CalendarEvent[] {
  const byId = new Map<string, CalendarEvent>();
  for (const e of events) {
    if (!byId.has(e.id)) byId.set(e.id, e);
  }
  return [...byId.values()].sort((a, b) => {
    const dk = a.dayKey.localeCompare(b.dayKey);
    if (dk !== 0) return dk;
    return a.sortKey.localeCompare(b.sortKey);
  });
}

export function filterCalendarTypes(
  events: CalendarEvent[],
  types: string[] | null | undefined,
): CalendarEvent[] {
  if (!types?.length) return events;
  const set = new Set(types);
  return events.filter((e) => set.has(e.type));
}
