export type SeriesPoint = { label: string; cents: number };

/** Bucket paid sales into chart points for the selected window. */
export function buildSalesSeries(
  orders: { totalCents: number; createdAt: Date }[],
  start: Date,
  end: Date,
): SeriesPoint[] {
  const spanMs = end.getTime() - start.getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  if (spanMs <= dayMs + 1000) {
    const buckets = Array.from({ length: 24 }, (_, hour) => ({
      label: `${hour}:00`,
      cents: 0,
    }));
    for (const order of orders) {
      const hour = order.createdAt.getHours();
      buckets[hour].cents += order.totalCents;
    }
    return buckets;
  }

  if (spanMs <= 45 * dayMs) {
    const days = Math.max(1, Math.ceil(spanMs / dayMs));
    const buckets: SeriesPoint[] = [];
    for (let i = 0; i < days; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      buckets.push({
        label: `${day.getDate()}/${day.getMonth() + 1}`,
        cents: 0,
      });
    }
    for (const order of orders) {
      const idx = Math.floor(
        (startOfLocalDay(order.createdAt).getTime() - startOfLocalDay(start).getTime()) /
          dayMs,
      );
      if (idx >= 0 && idx < buckets.length) buckets[idx].cents += order.totalCents;
    }
    return buckets;
  }

  const weeks: SeriesPoint[] = [];
  let cursor = startOfLocalDay(start);
  while (cursor <= end) {
    weeks.push({
      label: `${cursor.getDate()}/${cursor.getMonth() + 1}`,
      cents: 0,
    });
    cursor = addDays(cursor, 7);
  }
  for (const order of orders) {
    const idx = Math.floor(
      (startOfLocalDay(order.createdAt).getTime() - startOfLocalDay(start).getTime()) /
        (7 * dayMs),
    );
    if (idx >= 0 && idx < weeks.length) weeks[idx].cents += order.totalCents;
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
