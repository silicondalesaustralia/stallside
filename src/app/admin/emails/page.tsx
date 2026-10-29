import { requireAdmin } from "@/lib/session";
import {
  loadEmailStats,
  loadTrackingStart,
  parseRange,
} from "@/lib/email-stats/load-email-stats";
import { formatEmailDate } from "@/lib/email-stats/format";
import EmailRangeTabs from "./EmailRangeTabs";
import EmailStatsTable from "./EmailStatsTable";

export default async function AdminEmailsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  await requireAdmin();
  const range = parseRange((await searchParams).range);
  const [rows, trackingStart] = await Promise.all([
    loadEmailStats(range),
    loadTrackingStart(),
  ]);

  return (
    <main className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Emails</h1>
        <p className="mt-1 text-[var(--muted)]">
          Every email Vendl sends to owners, including broadcasts sent from scripts.
          Open and click rates are out of delivered emails.
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {trackingStart
            ? `Delivery, open, click and bounce tracking started ${formatEmailDate(trackingStart)}. Earlier emails only show sent and failed.`
            : "Delivery, open, click and bounce tracking starts once the Resend webhook sends its first event."}{" "}
          Apple Mail can count an open without the email being read, so treat open rates as a rough guide.
        </p>
      </div>
      <EmailRangeTabs active={range} />
      {rows.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No emails sent in this period.</p>
      ) : (
        <EmailStatsTable rows={rows} />
      )}
    </main>
  );
}
