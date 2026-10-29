import { prisma } from "@/lib/prisma";

export const EMAIL_STATS_RANGES = [
  { key: "7", label: "7 days", days: 7 },
  { key: "30", label: "30 days", days: 30 },
  { key: "90", label: "90 days", days: 90 },
  { key: "all", label: "All time", days: null },
] as const;

export type EmailStatsRangeKey = (typeof EMAIL_STATS_RANGES)[number]["key"];

export type EmailKindStats = {
  kind: string;
  latestSubject: string;
  lastSentAt: Date;
  sent: number;
  /** Sent since tracking started; the denominator for delivery-based rates. */
  tracked: number;
  failed: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
};

type Row = {
  kind: string | null;
  latest_subject: string;
  last_sent_at: Date;
  sent: bigint;
  tracked: bigint;
  failed: bigint;
  delivered: bigint;
  opened: bigint;
  clicked: bigint;
  bounced: bigint;
  complained: bigint;
};

export function parseRange(value: string | undefined): EmailStatsRangeKey {
  return EMAIL_STATS_RANGES.find((r) => r.key === value)?.key ?? "30";
}

function rangeStart(key: EmailStatsRangeKey): Date {
  const days = EMAIL_STATS_RANGES.find((r) => r.key === key)?.days ?? null;
  return days == null ? new Date(0) : new Date(Date.now() - days * 86_400_000);
}

/** Sends just before the first event can still be tracked, so allow a small lead. */
const TRACKING_LEAD_MS = 60_000;

/** One row per email kind; local console sends are excluded. */
export async function loadEmailStats(
  range: EmailStatsRangeKey,
  trackingStart: Date | null,
): Promise<EmailKindStats[]> {
  const since = rangeStart(range);
  const trackedSince = trackingStart
    ? new Date(trackingStart.getTime() - TRACKING_LEAD_MS)
    : new Date(8.64e15);
  const rows = await prisma.$queryRaw<Row[]>`
    SELECT
      "kind",
      (ARRAY_AGG("subject" ORDER BY "createdAt" DESC))[1] AS latest_subject,
      MAX("createdAt") AS last_sent_at,
      COUNT(*) FILTER (WHERE "status" = 'sent') AS sent,
      COUNT(*) FILTER (WHERE "status" = 'sent' AND "createdAt" >= ${trackedSince}) AS tracked,
      COUNT(*) FILTER (WHERE "status" = 'failed') AS failed,
      COUNT("deliveredAt") AS delivered,
      COUNT("firstOpenedAt") AS opened,
      COUNT("firstClickedAt") AS clicked,
      COUNT("bouncedAt") AS bounced,
      COUNT("complainedAt") AS complained
    FROM "EmailSendLog"
    WHERE "createdAt" >= ${since} AND "status" <> 'console'
    GROUP BY "kind"
    ORDER BY MAX("createdAt") DESC
  `;
  return rows.map((row) => ({
    kind: row.kind ?? "unlabelled",
    latestSubject: row.latest_subject,
    lastSentAt: row.last_sent_at,
    sent: Number(row.sent),
    tracked: Number(row.tracked),
    failed: Number(row.failed),
    delivered: Number(row.delivered),
    opened: Number(row.opened),
    clicked: Number(row.clicked),
    bounced: Number(row.bounced),
    complained: Number(row.complained),
  }));
}

/** When the first Resend event arrived; earlier sends have no delivery data. */
export async function loadTrackingStart(): Promise<Date | null> {
  const first = await prisma.resendWebhookEvent.findFirst({
    orderBy: { receivedAt: "asc" },
    select: { receivedAt: true },
  });
  return first?.receivedAt ?? null;
}
