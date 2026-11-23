import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { isStitchstackPartnerConfigured } from "@/lib/stitchstack";
import {
  fetchStitchstackAnalytics,
  type StitchstackAnalyticsSnapshot,
} from "@/lib/stitchstack-analytics";
import { readStitchstackPixel, type StitchstackPixelConfig } from "@/lib/stitchstack-pixel-parse";
import { pushOrdersToStitchstack } from "@/lib/stitchstack-orders-sync";

export type StitchstackSyncMeta = {
  lastOrderSyncAt?: string;
  lastAnalyticsSyncAt?: string;
  analyticsCache?: StitchstackAnalyticsSnapshot & { fetchedAt: string };
};

export type StoredStitchstackPixel = StitchstackPixelConfig & StitchstackSyncMeta;

export function readStoredStitchstackPixel(raw: unknown): StoredStitchstackPixel | null {
  const pixel = readStitchstackPixel(raw);
  if (!pixel || !raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  const meta: StitchstackSyncMeta = {};
  if (typeof obj.lastOrderSyncAt === "string") meta.lastOrderSyncAt = obj.lastOrderSyncAt;
  if (typeof obj.lastAnalyticsSyncAt === "string") meta.lastAnalyticsSyncAt = obj.lastAnalyticsSyncAt;
  if (obj.analyticsCache && typeof obj.analyticsCache === "object") {
    meta.analyticsCache = obj.analyticsCache as StitchstackSyncMeta["analyticsCache"];
  }
  return { ...pixel, ...meta };
}

async function saveStoredPixel(ownerId: string, stored: StoredStitchstackPixel) {
  await prisma.storefront.updateMany({
    where: { ownerId },
    data: { stitchstackPixel: stored as unknown as Prisma.InputJsonValue },
  });
}

/**
 * Bidirectional sync for one owner:
 * Vendl → SS orders (incremental after first full push)
 * SS → Vendl pixel analytics cache (30d snapshot for dashboard)
 */
export async function syncStitchstackForOwner(ownerId: string): Promise<{
  upserted: number;
  analytics: boolean;
}> {
  if (!isStitchstackPartnerConfigured()) {
    throw new Error("STITCHSTACK_PARTNER_API_KEY is not configured.");
  }

  const storefront = await prisma.storefront.findFirst({
    where: { ownerId },
    select: { stitchstackPixel: true },
  });
  const stored = readStoredStitchstackPixel(storefront?.stitchstackPixel);
  if (!stored) {
    return { upserted: 0, analytics: false };
  }

  const since = stored.lastOrderSyncAt ? new Date(stored.lastOrderSyncAt) : null;
  // Overlap window so late updates still upsert.
  const sinceWithOverlap =
    since && !Number.isNaN(since.getTime())
      ? new Date(since.getTime() - 24 * 60 * 60 * 1000)
      : null;

  const pushed = await pushOrdersToStitchstack(ownerId, { since: sinceWithOverlap });

  const analytics = await fetchStitchstackAnalytics({
    externalAccountId: ownerId,
    range: "30d",
    fromParam: "",
    toParam: "",
  });

  const nowIso = new Date().toISOString();
  const next: StoredStitchstackPixel = {
    ...stored,
    lastOrderSyncAt: nowIso,
    lastAnalyticsSyncAt: analytics ? nowIso : stored.lastAnalyticsSyncAt,
    ...(analytics
      ? { analyticsCache: { ...analytics, fetchedAt: nowIso } }
      : stored.analyticsCache
        ? { analyticsCache: stored.analyticsCache }
        : {}),
  };
  await saveStoredPixel(ownerId, next);

  return { upserted: pushed.upserted, analytics: Boolean(analytics) };
}

/** Owners who already installed the Stitchstack pixel (eligible for cron sync). */
export async function listStitchstackSyncOwnerIds(limit = 200): Promise<string[]> {
  const rows = await prisma.storefront.findMany({
    where: { stitchstackPixel: { not: Prisma.DbNull } },
    select: { ownerId: true, stitchstackPixel: true },
    take: limit,
  });
  return rows
    .filter((row) => Boolean(readStitchstackPixel(row.stitchstackPixel)))
    .map((row) => row.ownerId);
}
