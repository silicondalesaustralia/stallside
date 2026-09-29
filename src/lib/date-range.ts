import {
  addDays,
  addMonths,
  calendarDateValue,
  endOfDay,
  startOfDay,
  startOfZonedDay,
} from "@/lib/zoned-day";

export const RANGE_PRESETS = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "7 days" },
  { key: "14d", label: "14 days" },
  { key: "30d", label: "30 days" },
  { key: "6m", label: "6 months" },
  { key: "12m", label: "12 months" },
  { key: "all", label: "All time" },
  { key: "custom", label: "Custom" },
] as const;

/** Owner dashboards keep the shorter set. Admin opts into All time. */
export const DEFAULT_RANGE_PRESETS = RANGE_PRESETS.filter(
  (preset) => preset.key !== "all",
);

export type RangeKey = (typeof RANGE_PRESETS)[number]["key"];

export type DateWindow = {
  key: RangeKey;
  label: string;
  start: Date;
  end: Date;
  prevStart: Date;
  prevEnd: Date;
  fromParam: string;
  toParam: string;
};

export function toDateInputValue(d: Date, timeZone?: string) {
  return calendarDateValue(d, timeZone);
}

function parseDateInput(value: string | undefined, timeZone?: string): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = timeZone
    ? startOfZonedDay(y, m, d, timeZone)
    : new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function withCompare(
  start: Date,
  end: Date,
  key: RangeKey,
  label: string,
  timeZone?: string,
): DateWindow {
  const durationMs = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - durationMs);
  return {
    key,
    label,
    start,
    end,
    prevStart,
    prevEnd,
    fromParam: toDateInputValue(start, timeZone),
    toParam: toDateInputValue(end, timeZone),
  };
}

export function resolveDateWindow(
  searchParams: {
    range?: string;
    from?: string;
    to?: string;
  },
  timeZone?: string,
): DateWindow {
  const now = new Date();
  const todayStart = startOfDay(now, timeZone);
  const todayEnd = endOfDay(now, timeZone);
  const key = (RANGE_PRESETS.some((p) => p.key === searchParams.range)
    ? searchParams.range
    : "today") as RangeKey;

  if (key === "yesterday") {
    const start = addDays(todayStart, -1, timeZone);
    return withCompare(start, endOfDay(start, timeZone), key, "Yesterday", timeZone);
  }
  if (key === "7d") {
    return withCompare(addDays(todayStart, -6, timeZone), todayEnd, key, "Last 7 days", timeZone);
  }
  if (key === "14d") {
    return withCompare(addDays(todayStart, -13, timeZone), todayEnd, key, "Last 14 days", timeZone);
  }
  if (key === "30d") {
    return withCompare(addDays(todayStart, -29, timeZone), todayEnd, key, "Last 30 days", timeZone);
  }
  if (key === "6m") {
    return withCompare(addMonths(todayStart, -6, timeZone), todayEnd, key, "Last 6 months", timeZone);
  }
  if (key === "12m") {
    return withCompare(addMonths(todayStart, -12, timeZone), todayEnd, key, "Last 12 months", timeZone);
  }
  if (key === "all") {
    const allStart = timeZone
      ? startOfZonedDay(2024, 1, 1, timeZone)
      : startOfDay(new Date(2024, 0, 1));
    return withCompare(allStart, todayEnd, key, "All time", timeZone);
  }
  if (key === "custom") {
    const from = parseDateInput(searchParams.from, timeZone) ?? addDays(todayStart, -29, timeZone);
    const to = parseDateInput(searchParams.to, timeZone) ?? todayStart;
    const start = startOfDay(from <= to ? from : to, timeZone);
    const end = endOfDay(from <= to ? to : from, timeZone);
    return withCompare(start, end, key, "Custom range", timeZone);
  }

  return withCompare(todayStart, todayEnd, "today", "Today", timeZone);
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) {
    if (current === 0) return 0;
    return null;
  }
  return ((current - previous) / previous) * 100;
}
