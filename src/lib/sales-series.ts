import { zonedYmd } from "@/lib/zoned-day";

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

const DAY_MS = 24 * 60 * 60 * 1000;

function calendarOf(date: Date, timeZone?: string) {
  if (!timeZone) {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
    };
  }
  return zonedYmd(date, timeZone);
}

function dayStamp(date: Date, timeZone?: string) {
  const parts = calendarOf(date, timeZone);
  return Date.UTC(parts.year, parts.month - 1, parts.day);
}

function dayLabel(stamp: number) {
  const day = new Date(stamp);
  return `${day.getUTCDate()}/${day.getUTCMonth() + 1}`;
}

function emptyBuckets(
  start: Date,
  end: Date,
  timeZone?: string,
): { buckets: SeriesPoint[]; span: "hour" | "day" | "week" } {
  const spanMs = end.getTime() - start.getTime();

  if (spanMs <= DAY_MS + 1000) {
    return {
      span: "hour",
      buckets: Array.from({ length: 24 }, (_, hour) => ({
        label: `${hour}:00`,
        cents: 0,
      })),
    };
  }

  if (spanMs <= 45 * DAY_MS) {
    const days = Math.max(1, Math.ceil(spanMs / DAY_MS));
    const origin = dayStamp(start, timeZone);
    return {
      span: "day",
      buckets: Array.from({ length: days }, (_, i) => ({
        label: dayLabel(origin + i * DAY_MS),
        cents: 0,
      })),
    };
  }

  const buckets: SeriesPoint[] = [];
  let cursor = dayStamp(start, timeZone);
  const endStamp = dayStamp(end, timeZone);
  while (cursor <= endStamp) {
    buckets.push({ label: dayLabel(cursor), cents: 0 });
    cursor += 7 * DAY_MS;
  }
  return { span: "week", buckets };
}

function bucketIndex(
  createdAt: Date,
  start: Date,
  span: "hour" | "day" | "week",
  length: number,
  timeZone?: string,
): number {
  if (span === "hour") return calendarOf(createdAt, timeZone).hour;
  const idx = Math.floor(
    (dayStamp(createdAt, timeZone) - dayStamp(start, timeZone)) /
      (span === "week" ? 7 * DAY_MS : DAY_MS),
  );
  if (idx < 0 || idx >= length) return -1;
  return idx;
}

/** Bucket paid sales into chart points for the selected window. */
export function buildSalesSeries(
  orders: { totalCents: number; createdAt: Date }[],
  start: Date,
  end: Date,
  timeZone?: string,
): SeriesPoint[] {
  const { buckets, span } = emptyBuckets(start, end, timeZone);
  for (const order of orders) {
    const idx = bucketIndex(order.createdAt, start, span, buckets.length, timeZone);
    if (idx >= 0) buckets[idx].cents += order.totalCents;
  }
  return buckets;
}

/** All + per-channel series sharing the same time buckets. */
export function buildChannelSalesSeries(
  orders: ChannelOrderRow[],
  start: Date,
  end: Date,
  timeZone?: string,
): ChannelSalesSeries {
  const { buckets, span } = emptyBuckets(start, end, timeZone);
  const all = buckets.map((b) => ({ ...b }));
  const subscription = buckets.map((b) => ({ ...b }));
  const preorder = buckets.map((b) => ({ ...b }));
  const stand = buckets.map((b) => ({ ...b }));

  for (const order of orders) {
    const idx = bucketIndex(order.createdAt, start, span, buckets.length, timeZone);
    if (idx < 0) continue;
    all[idx].cents += order.totalCents;
    const channel = orderSalesChannel(order);
    if (channel === "subscription") subscription[idx].cents += order.totalCents;
    else if (channel === "preorder") preorder[idx].cents += order.totalCents;
    else stand[idx].cents += order.totalCents;
  }

  return { all, subscription, preorder, stand };
}
