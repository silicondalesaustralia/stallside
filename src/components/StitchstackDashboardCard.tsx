import { STITCHSTACK_ANALYTICS_HANDOFF_PATH } from "@/lib/stitchstack-constants";
import type { StitchstackAnalyticsSnapshot } from "@/lib/stitchstack-analytics";

function statusBanner(flag: string | undefined, connected: boolean) {
  if (flag === "synced") {
    return "Synced — Vendl orders pushed to Stitchstack and pixel metrics refreshed.";
  }
  if (flag === "missing_email") return "Add an email on your account before opening Analytics.";
  if (flag === "impersonating") {
    // Legacy query from older builds; Sync now no longer blocks login-as.
    return "Retry Sync now — support login-as can sync Analytics.";
  }
  // Unconnected sellers should see a connect CTA, not a sync failure.
  if (flag === "error" && connected) {
    return "Could not sync with Stitchstack. Try again in a minute.";
  }
  return null;
}

export default function StitchstackDashboardCard({
  analytics,
  partnerReady,
  connected,
  lastSyncedAt,
  status,
  rangeKey = "30d",
  fromParam = "",
  toParam = "",
}: {
  analytics: (StitchstackAnalyticsSnapshot & { fetchedAt?: string }) | null;
  /** Server env can talk to Stitchstack (API key). */
  partnerReady: boolean;
  /** This seller has installed the Stitchstack pixel (linked workspace). */
  connected: boolean;
  lastSyncedAt?: string | null;
  status?: string;
  /** Matches the home dashboard date picker. */
  rangeKey?: string;
  fromParam?: string;
  toParam?: string;
}) {
  const banner = statusBanner(status, connected);
  const kpis = analytics?.kpis;

  if (!partnerReady) {
    return (
      <section className="dash-card flex flex-col gap-3 p-5">
        <h2 className="text-base font-semibold text-[var(--ink)]">Stitchstack Analytics</h2>
        <p className="text-sm text-[var(--muted)]">
          Analytics pairing isn’t available on this environment yet.
        </p>
      </section>
    );
  }

  if (!connected) {
    return (
      <section className="dash-card flex flex-col gap-4 p-5" data-testid="dashboard-stitchstack-connect">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 max-w-xl">
            <h2 className="text-base font-semibold text-[var(--ink)]">Stitchstack Analytics</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Connect once to install the storefront pixel, push orders into Stitchstack, and open your
              Analytics dashboard. Sync then runs automatically every 12 hours.
            </p>
          </div>
          <a
            href={STITCHSTACK_ANALYTICS_HANDOFF_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-500"
            data-testid="dashboard-connect-stitchstack"
          >
            Connect Analytics ↗
          </a>
        </div>
        {status === "missing_email" ? (
          <p className="text-sm font-medium text-teal-800">{banner}</p>
        ) : status === "error" ? (
          <p className="text-sm font-medium text-teal-800">
            Couldn’t finish connecting. Try Connect Analytics again in a minute.
          </p>
        ) : null}
      </section>
    );
  }

  return (
    <section className="dash-card flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--ink)]">Stitchstack Analytics</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {analytics?.range_label ??
              "Orders push to Stitchstack; pixel traffic pulls back here every 12 hours."}
          </p>
          {lastSyncedAt ? (
            <p className="mt-1 text-xs text-[var(--muted)]">
              Last sync {new Date(lastSyncedAt).toLocaleString()}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={STITCHSTACK_ANALYTICS_HANDOFF_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-teal-600 px-3 py-2 text-sm font-bold text-white hover:bg-teal-500"
            data-testid="dashboard-open-stitchstack"
          >
            Open Analytics ↗
          </a>
          <form action="/dashboard/analytics/stitchstack/sync" method="post">
            <input type="hidden" name="range" value={rangeKey} />
            {fromParam ? <input type="hidden" name="from" value={fromParam} /> : null}
            {toParam ? <input type="hidden" name="to" value={toParam} /> : null}
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--sand)]"
              data-testid="dashboard-sync-stitchstack"
            >
              Sync now
            </button>
          </form>
        </div>
      </div>

      {banner ? <p className="text-sm font-medium text-teal-800">{banner}</p> : null}

      {kpis ? (
        <div className="grid gap-3 sm:grid-cols-4">
          <Metric label="Sessions" value={String(kpis.sessions)} prev={analytics?.previous_kpis?.sessions} />
          <Metric label="Visitors" value={String(kpis.visitors)} prev={analytics?.previous_kpis?.visitors} />
          <Metric label="Pageviews" value={String(kpis.pageviews)} prev={analytics?.previous_kpis?.pageviews} />
          <Metric
            label="Pages / session"
            value={String(kpis.pagesPerSession)}
            prev={analytics?.previous_kpis?.pagesPerSession}
          />
        </div>
      ) : null}

      {analytics && !analytics.has_hits ? (
        <p className="text-sm text-[var(--muted)]">
          Waiting for the first storefront pixel hit. Order history is already syncing into Stitchstack.
        </p>
      ) : null}

      {analytics?.top_referrers?.length ? (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Top referrers</h3>
          <ul className="mt-2 space-y-1 text-sm text-[var(--ink)]">
            {analytics.top_referrers.slice(0, 5).map((row) => (
              <li className="flex justify-between gap-3" key={row.referrer}>
                <span className="truncate">{row.referrer}</span>
                <span className="shrink-0 tabular-nums text-[var(--muted)]">{row.sessions}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function Metric({
  label,
  value,
  prev,
}: {
  label: string;
  value: string;
  prev?: number;
}) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--sand)]/40 px-3 py-3 text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 font-receipt text-xl font-semibold tabular-nums text-[var(--ink)]">{value}</p>
      {typeof prev === "number" ? (
        <p className="mt-1 text-xs text-[var(--muted)]">prev {prev}</p>
      ) : null}
    </div>
  );
}
