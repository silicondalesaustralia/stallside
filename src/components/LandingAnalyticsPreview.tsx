import DashboardStat from "@/components/DashboardStat";
import SalesSeriesChart from "@/components/SalesSeriesChart";
import { formatMoney } from "@/lib/money";
import type { SeriesPoint } from "@/lib/sales-series";

/** Sample Green Valley Eggs week — marketing preview of owner analytics. */
const CURRENT: SeriesPoint[] = [
  { label: "Mon", cents: 4200 },
  { label: "Tue", cents: 5600 },
  { label: "Wed", cents: 3800 },
  { label: "Thu", cents: 7200 },
  { label: "Fri", cents: 9100 },
  { label: "Sat", cents: 12400 },
  { label: "Sun", cents: 6800 },
];

const PREVIOUS: SeriesPoint[] = [
  { label: "Mon", cents: 3600 },
  { label: "Tue", cents: 4100 },
  { label: "Wed", cents: 4500 },
  { label: "Thu", cents: 5200 },
  { label: "Fri", cents: 7800 },
  { label: "Sat", cents: 10200 },
  { label: "Sun", cents: 5400 },
];

const CURRENT_TOTAL = CURRENT.reduce((sum, p) => sum + p.cents, 0);
const PREV_TOTAL = PREVIOUS.reduce((sum, p) => sum + p.cents, 0);
const CURRENT_ORDERS = 47;
const PREV_ORDERS = 39;
const CURRENT_CASH = 31800;
const PREV_CASH = 27400;
const CURRENT_CARD = CURRENT_TOTAL - CURRENT_CASH;
const PREV_CARD = PREV_TOTAL - PREV_CASH;

export default function LandingAnalyticsPreview() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
      <div className="relative rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-[var(--pad-lg)]">
        <div
          aria-hidden
          className="absolute left-5 top-5 size-7 border-l-2 border-t-2 border-[var(--field)]/30 sm:left-7 sm:top-7"
          style={{ borderTopLeftRadius: 8 }}
        />
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--leaf)]">
          Owner analytics · example
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
          Know what sold — and when
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-snug text-[var(--muted)]">
          Compare this week with the last. See revenue, orders, and how cash vs
          Tap &amp; Go are trending — the same view stall owners get in the app.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-[var(--radius-pill)] bg-[var(--leaf)] px-3 py-1.5 font-semibold text-white">
            7 days
          </span>
          <span className="text-[var(--muted)]">vs previous 7 days</span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <DashboardStat
            label="Revenue"
            value={formatMoney(CURRENT_TOTAL, "AUD")}
            current={CURRENT_TOTAL}
            previous={PREV_TOTAL}
          />
          <DashboardStat
            label="Total orders"
            value={String(CURRENT_ORDERS)}
            current={CURRENT_ORDERS}
            previous={PREV_ORDERS}
          />
          <DashboardStat
            label="Cash / PayID"
            value={formatMoney(CURRENT_CASH, "AUD")}
            current={CURRENT_CASH}
            previous={PREV_CASH}
          />
          <DashboardStat
            label="Card / Tap & Go"
            value={formatMoney(CURRENT_CARD, "AUD")}
            current={CURRENT_CARD}
            previous={PREV_CARD}
          />
        </div>

        <div className="mt-6">
          <SalesSeriesChart
            points={CURRENT}
            previousPoints={PREVIOUS}
            currency="AUD"
            title="Green Valley Eggs · last 7 days"
          />
        </div>
      </div>
    </section>
  );
}
