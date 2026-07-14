export const RANGE_PRESETS = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "7 days" },
  { key: "14d", label: "14 days" },
  { key: "30d", label: "30 days" },
  { key: "6m", label: "6 months" },
  { key: "12m", label: "12 months" },
  { key: "custom", label: "Custom" },
] as const;

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

function startOfLocalDay(d: Date) {
  const next = new Date(d);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfLocalDay(d: Date) {
  const next = new Date(d);
  next.setHours(23, 59, 59, 999);
  return next;
}

function addDays(d: Date, days: number) {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(d: Date, months: number) {
  const next = new Date(d);
  next.setMonth(next.getMonth() + months);
  return next;
}

export function toDateInputValue(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDateInput(value: string | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function withCompare(start: Date, end: Date, key: RangeKey, label: string): DateWindow {
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
    fromParam: toDateInputValue(start),
    toParam: toDateInputValue(end),
  };
}

export function resolveDateWindow(searchParams: {
  range?: string;
  from?: string;
  to?: string;
}): DateWindow {
  const now = new Date();
  const todayStart = startOfLocalDay(now);
  const todayEnd = endOfLocalDay(now);
  const key = (RANGE_PRESETS.some((p) => p.key === searchParams.range)
    ? searchParams.range
    : "today") as RangeKey;

  if (key === "yesterday") {
    const start = addDays(todayStart, -1);
    return withCompare(start, endOfLocalDay(start), key, "Yesterday");
  }
  if (key === "7d") {
    return withCompare(addDays(todayStart, -6), todayEnd, key, "Last 7 days");
  }
  if (key === "14d") {
    return withCompare(addDays(todayStart, -13), todayEnd, key, "Last 14 days");
  }
  if (key === "30d") {
    return withCompare(addDays(todayStart, -29), todayEnd, key, "Last 30 days");
  }
  if (key === "6m") {
    return withCompare(addMonths(todayStart, -6), todayEnd, key, "Last 6 months");
  }
  if (key === "12m") {
    return withCompare(addMonths(todayStart, -12), todayEnd, key, "Last 12 months");
  }
  if (key === "custom") {
    const from = parseDateInput(searchParams.from) ?? addDays(todayStart, -29);
    const to = parseDateInput(searchParams.to) ?? todayStart;
    const start = startOfLocalDay(from <= to ? from : to);
    const end = endOfLocalDay(from <= to ? to : from);
    return withCompare(start, end, key, "Custom range");
  }

  return withCompare(todayStart, todayEnd, "today", "Today");
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) {
    if (current === 0) return 0;
    return null;
  }
  return ((current - previous) / previous) * 100;
}
