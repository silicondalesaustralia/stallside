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
): SaasSeriesPoint[] {
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
      buckets[event.at.getHours()][event.metric] += 1;
    }
    return buckets;
  }

  if (spanMs <= 45 * dayMs) {
    const days = Math.max(1, Math.ceil(spanMs / dayMs));
    const buckets: SaasSeriesPoint[] = [];
    for (let i = 0; i < days; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      buckets.push({
        label: `${day.getDate()}/${day.getMonth() + 1}`,
        ...empty(),
      });
    }
    for (const event of events) {
      const idx = Math.floor(
        (startOfLocalDay(event.at).getTime() - startOfLocalDay(start).getTime()) /
          dayMs,
      );
      if (idx >= 0 && idx < buckets.length) buckets[idx][event.metric] += 1;
    }
    return buckets;
  }

  const weeks: SaasSeriesPoint[] = [];
  let cursor = startOfLocalDay(start);
  while (cursor <= end) {
    weeks.push({
      label: `${cursor.getDate()}/${cursor.getMonth() + 1}`,
      ...empty(),
    });
    cursor = addDays(cursor, 7);
  }
  for (const event of events) {
    const idx = Math.floor(
      (startOfLocalDay(event.at).getTime() - startOfLocalDay(start).getTime()) /
        (7 * dayMs),
    );
    if (idx >= 0 && idx < weeks.length) weeks[idx][event.metric] += 1;
  }
  return weeks;
}

function startOfLocalDay(d: Date) {
  const next = new Date(d);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(d: Date, days: number) {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}
