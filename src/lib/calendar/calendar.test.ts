import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { dedupeCalendarEvents } from "./dedupe";
import {
  dayKeyInTz,
  formatAnchorParam,
  parseAnchorDate,
  weekRange,
  monthRange,
  agendaRange,
} from "./range";
import type { CalendarEvent } from "./types";

const TZ = "Australia/Adelaide";

function evt(partial: Partial<CalendarEvent> & Pick<CalendarEvent, "id" | "dayKey">): CalendarEvent {
  return {
    type: "pickup",
    title: "Test",
    startsAt: new Date("2026-09-12T00:00:00.000Z"),
    endsAt: null,
    allDay: true,
    status: null,
    sourceType: "test",
    sourceId: "1",
    href: "/",
    editHref: null,
    location: null,
    summary: null,
    sortKey: "0",
    metadata: {},
    editable: false,
    durationEditable: false,
    rescheduleAction: null,
    ...partial,
  };
}

describe("calendar range", () => {
  it("formats day keys in seller timezone", () => {
    const d = new Date("2026-09-11T14:30:00.000Z");
    const key = dayKeyInTz(d, TZ);
    assert.match(key, /^\d{4}-\d{2}-\d{2}$/);
  });

  it("parses anchor date param", () => {
    const a = parseAnchorDate("2026-09-12", TZ);
    assert.equal(formatAnchorParam(a, TZ), "2026-09-12");
  });

  it("builds monday-start week with 7 days", () => {
    const anchor = parseAnchorDate("2026-09-12", TZ);
    const w = weekRange(anchor, TZ);
    assert.equal(w.days.length, 7);
    assert.ok(w.end > w.start);
  });

  it("builds month range covering anchor month", () => {
    const anchor = parseAnchorDate("2026-09-15", TZ);
    const m = monthRange(anchor, TZ);
    assert.ok(m.end > m.start);
    assert.ok(m.weeks.length >= 4);
  });

  it("builds agenda range forward", () => {
    const anchor = parseAnchorDate("2026-09-01", TZ);
    const a = agendaRange(anchor, TZ, 14);
    assert.ok(a.end > a.start);
  });
});

describe("calendar window expansion", () => {
  it("expands weekly pickup windows into timed instances", async () => {
    const { expandPickupWindowInstances } = await import("./expand-windows");
    const { PickupWindowRecurrence } = await import("@/generated/prisma/client");
    const start = parseAnchorDate("2026-09-01", TZ);
    const end = parseAnchorDate("2026-09-30", TZ);
    const instances = expandPickupWindowInstances(
      {
        id: "pw1",
        recurrence: PickupWindowRecurrence.WEEKLY,
        timezone: TZ,
        weekday: 6,
        startTimeMin: 8 * 60,
        endTimeMin: 10 * 60,
        startsAt: null,
        endsAt: null,
      },
      start,
      end,
    );
    assert.ok(instances.length >= 4);
    assert.ok(instances[0].endsAt > instances[0].startsAt);
  });
});

describe("calendar event display", () => {
  it("treats midnight markets without end as all-day", async () => {
    const { resolveMarketAllDay } = await import("./event-display");
    const { zonedWallClockToUtc } = await import("@/lib/stand-timezone");
    const TZ = "Australia/Adelaide";
    const midnight = zonedWallClockToUtc(2026, 8, 3, 0, 0, 0, TZ);
    assert.equal(resolveMarketAllDay(midnight, null, TZ), true);
    const nine = zonedWallClockToUtc(2026, 8, 3, 9, 0, 0, TZ);
    assert.equal(resolveMarketAllDay(nine, null, TZ), false);
  });

  it("defaults timed end when missing", async () => {
    const { resolveTimedEnd } = await import("./event-display");
    const start = new Date("2026-09-03T09:00:00.000Z");
    const end = resolveTimedEnd(start, null, false);
    assert.ok(end);
    assert.equal(end!.getTime() - start.getTime(), 2 * 60 * 60 * 1000);
  });
});

describe("calendar dedupe", () => {
  it("drops duplicate ids", () => {
    const a = evt({ id: "pickup:x", dayKey: "2026-09-12" });
    const b = evt({ id: "pickup:x", dayKey: "2026-09-12", title: "Other" });
    const out = dedupeCalendarEvents([a, b]);
    assert.equal(out.length, 1);
    assert.equal(out[0].title, "Test");
  });

  it("keeps distinct pickup windows", () => {
    const a = evt({ id: "pickup:a", dayKey: "2026-09-12" });
    const b = evt({ id: "pickup:b", dayKey: "2026-09-12" });
    assert.equal(dedupeCalendarEvents([a, b]).length, 2);
  });
});
