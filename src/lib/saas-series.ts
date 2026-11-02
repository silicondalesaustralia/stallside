import { addDays, startOfDay, zonedYmd } from "@/lib/zoned-day";

export type SaasMetricKey = "owners" | "demos" | "invites";

export type SaasSeriesPoint = {
  label: string;
  owners: number;
  demos: number;
  invites: number;
};

export const SAAS_METRICS: {
  key: SaasMetricKey;
  label: string;
  color: string;
}[] = [
  { key: "owners", label: "New owners", color: "var(--leaf)" },
  { key: "demos", label: "Demo completions", color: "var(--marigold)" },
  { key: "invites", label: "Invite redemptions", color: "#3B82F6" },
];

/** Bucket SaaS events into chart points for the selected window. */
export function buildSaasSeries(
  events: { at: Date; metric: SaasMetricKey }[],
  start: Date,
  end: Date,
  timeZone?: string,
): SaasSeriesPoint[] {
  const ymd = (d: Date) =>
    timeZone
      ? zonedYmd(d, timeZone)
      : { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(), hour: d.getHours() };
  const dayIndex = (d: Date) => {
    const p = ymd(d);
    return Date.UTC(p.year, p.month - 1, p.day) / (24 * 60 * 60 * 1000);
  };
  const dayLabel = (d: Date) => {
    const p = ymd(d);
    return `${p.day}/${p.month}`;
  };
  const spanMs = end.getTime() - start.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const empty = (): Omit<SaasSeriesPoint, "label"> => ({
    owners: 0,
    demos: 0,
    invites: 0,
  });

  if (spanMs <= dayMs + 1000) {
    const buckets: SaasSeriesPoint[] = Array.from({ length: 24 }, (_, hour) => ({
      label: `${hour}:00`,
      ...empty(),
    }));
    for (const event of events) {
      buckets[ymd(event.at).hour][event.metric] += 1;
    }
    return buckets;
  }

  const origin = dayIndex(start);
  if (spanMs <= 45 * dayMs) {
    const days = Math.max(1, Math.ceil(spanMs / dayMs));
    const buckets: SaasSeriesPoint[] = [];
    for (let i = 0; i < days; i++) {
      buckets.push({ label: dayLabel(addDays(start, i, timeZone)), ...empty() });
    }
    for (const event of events) {
      const idx = dayIndex(event.at) - origin;
      if (idx >= 0 && idx < buckets.length) buckets[idx][event.metric] += 1;
    }
    return buckets;
  }

  const weeks: SaasSeriesPoint[] = [];
  let cursor = startOfDay(start, timeZone);
  while (cursor <= end) {
    weeks.push({ label: dayLabel(cursor), ...empty() });
    cursor = addDays(cursor, 7, timeZone);
  }
  for (const event of events) {
    const idx = Math.floor((dayIndex(event.at) - origin) / 7);
    if (idx >= 0 && idx < weeks.length) weeks[idx][event.metric] += 1;
  }
  return weeks;
}
