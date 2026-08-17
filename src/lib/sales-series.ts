export type SeriesPoint = { label: string; cents: number };

export type SalesChannel = "subscription" | "preorder" | "stand";

export type ChannelOrderRow = {
  totalCents: number;
  createdAt: Date;
  isPreOrder: boolean;
  shopperSubscriptionId: string | null;
};

export type ChannelSalesSeries = {
  all: SeriesPoint[];
  subscription: SeriesPoint[];
  preorder: SeriesPoint[];
  stand: SeriesPoint[];
};

export function orderSalesChannel(order: {
  isPreOrder: boolean;
  shopperSubscriptionId: string | null;
}): SalesChannel {
  if (order.shopperSubscriptionId) return "subscription";
  if (order.isPreOrder) return "preorder";
  return "stand";
}

function emptyBuckets(
  start: Date,
  end: Date,
): { buckets: SeriesPoint[]; span: "hour" | "day" | "week" } {
  const spanMs = end.getTime() - start.getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  if (spanMs <= dayMs + 1000) {
    return {
      span: "hour",
      buckets: Array.from({ length: 24 }, (_, hour) => ({
        label: `${hour}:00`,
        cents: 0,
      })),
    };
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
    return { span: "day", buckets };
  }

  const buckets: SeriesPoint[] = [];
  let cursor = startOfLocalDay(start);
  while (cursor <= end) {
    buckets.push({
      label: `${cursor.getDate()}/${cursor.getMonth() + 1}`,
      cents: 0,
    });
    cursor = addDays(cursor, 7);
  }
  return { span: "week", buckets };
}

function bucketIndex(
  createdAt: Date,
  start: Date,
  span: "hour" | "day" | "week",
  length: number,
): number {
  const dayMs = 24 * 60 * 60 * 1000;
  if (span === "hour") return createdAt.getHours();
  const idx = Math.floor(
    (startOfLocalDay(createdAt).getTime() - startOfLocalDay(start).getTime()) /
      (span === "week" ? 7 * dayMs : dayMs),
  );
  if (idx < 0 || idx >= length) return -1;
  return idx;
}

/** Bucket paid sales into chart points for the selected window. */
export function buildSalesSeries(
  orders: { totalCents: number; createdAt: Date }[],
  start: Date,
  end: Date,
): SeriesPoint[] {
  const { buckets, span } = emptyBuckets(start, end);
  for (const order of orders) {
    const idx = bucketIndex(order.createdAt, start, span, buckets.length);
    if (idx >= 0) buckets[idx].cents += order.totalCents;
  }
  return buckets;
}

/** All + per-channel series sharing the same time buckets. */
export function buildChannelSalesSeries(
  orders: ChannelOrderRow[],
  start: Date,
  end: Date,
): ChannelSalesSeries {
  const { buckets, span } = emptyBuckets(start, end);
  const all = buckets.map((b) => ({ ...b }));
  const subscription = buckets.map((b) => ({ ...b }));
  const preorder = buckets.map((b) => ({ ...b }));
  const stand = buckets.map((b) => ({ ...b }));

  for (const order of orders) {
    const idx = bucketIndex(order.createdAt, start, span, buckets.length);
    if (idx < 0) continue;
    all[idx].cents += order.totalCents;
    const channel = orderSalesChannel(order);
    if (channel === "subscription") subscription[idx].cents += order.totalCents;
    else if (channel === "preorder") preorder[idx].cents += order.totalCents;
    else stand[idx].cents += order.totalCents;
  }

  return { all, subscription, preorder, stand };
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
