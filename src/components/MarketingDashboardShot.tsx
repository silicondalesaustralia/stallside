import DashboardGreeting from "@/components/DashboardGreeting";
import DashboardLowStockCard from "@/components/DashboardLowStockCard";
import DashboardStat from "@/components/DashboardStat";
import MarketingDashboardSidebar from "@/components/MarketingDashboardSidebar";
import PaymentMethodValue from "@/components/PaymentMethodValue";
import SalesSeriesChart from "@/components/SalesSeriesChart";
import { formatMoney } from "@/lib/money";
import type { SeriesPoint } from "@/lib/sales-series";

const SERIES: SeriesPoint[] = [
  { label: "Mon", cents: 9800 },
  { label: "Tue", cents: 12400 },
  { label: "Wed", cents: 8600 },
  { label: "Thu", cents: 15200 },
  { label: "Fri", cents: 21400 },
  { label: "Sat", cents: 28600 },
  { label: "Sun", cents: 16800 },
];

const PREV: SeriesPoint[] = [
  { label: "Mon", cents: 8200 },
  { label: "Tue", cents: 10100 },
  { label: "Wed", cents: 9400 },
  { label: "Thu", cents: 12800 },
  { label: "Fri", cents: 17600 },
  { label: "Sat", cents: 24100 },
  { label: "Sun", cents: 13900 },
];

const SALES = SERIES.reduce((s, p) => s + p.cents, 0);
const PREV_SALES = PREV.reduce((s, p) => s + p.cents, 0);
const ORDERS = 64;
const PREV_ORDERS = 51;

const LOW_STOCK = [
  { id: "eggs", name: "1 × Dozen Eggs", stockQuantity: 3 },
  { id: "honey", name: "Honey 500g", stockQuantity: 2 },
  { id: "loaf", name: "Sourdough loaf", stockQuantity: 4 },
];

const RECENT = [
  { name: "Jess M.", total: 1500, method: "Card", when: "12 min ago" },
  { name: "Walk-up", total: 1000, method: "Cash", when: "41 min ago" },
  { name: "Tom R.", total: 2800, method: "Apple Pay", when: "1 hr ago" },
  { name: "Sam K.", total: 4500, method: "Card", when: "2 hr ago" },
] as const;

/** Full dashboard chrome (sidebar + home) for marketing pages. */
export default function MarketingDashboardShot({
  currency = "AUD",
  standName = "Green Valley Eggs",
}: {
  currency?: string;
  standName?: string;
}) {
  return (
    <div
      className="pointer-events-none select-none overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--wash)] shadow-xl"
      aria-hidden
    >
      <div className="flex items-center gap-2 border-b border-[var(--line)] bg-[var(--panel)] px-3 py-2.5 sm:px-4">
        <span className="size-2.5 rounded-full bg-[var(--gone)]/80" />
        <span className="size-2.5 rounded-full bg-[var(--marigold)]" />
        <span className="size-2.5 rounded-full bg-[var(--leaf)]" />
        <span className="ml-2 truncate font-mono text-[11px] text-[var(--muted)]">
          vendl.app/dashboard
        </span>
      </div>

      <div className="flex min-h-[32rem] gap-3 bg-[var(--wash)] p-2 sm:min-h-[36rem] sm:gap-4 sm:p-3">
        <MarketingDashboardSidebar standName={standName} />

        <div className="min-w-0 flex-1 space-y-4 overflow-x-hidden rounded-xl bg-[var(--wash)] p-3 sm:space-y-5 sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <DashboardGreeting standName={standName} />
            <span className="rounded-[var(--radius-pill)] bg-[var(--leaf)] px-3 py-1.5 text-xs font-semibold text-white">
              Last 7 days
            </span>
          </div>

          <div className="flex flex-col gap-3 xl:flex-row xl:items-stretch">
            <div className="grid min-h-[154px] grid-cols-3 gap-2 sm:gap-3 xl:min-w-0 xl:flex-[1.15] [&>*]:min-w-0">
              <DashboardStat
                label="Sales"
                value={formatMoney(SALES, currency)}
                current={SALES}
                previous={PREV_SALES}
              />
              <DashboardStat
                label="Orders"
                value={String(ORDERS)}
                current={ORDERS}
                previous={PREV_ORDERS}
              />
              <DashboardStat
                label="Payment Method"
                value={<PaymentMethodValue hasCash hasCheckout />}
              />
            </div>
            <div className="min-h-[154px] min-w-0 xl:flex-1">
              <SalesSeriesChart
                points={SERIES}
                previousPoints={PREV}
                currency={currency}
                title="Last 7 days vs prior"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
            <div className="dash-card flex min-h-[180px] flex-1 flex-col p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                Pre-orders
              </p>
              <p className="mt-3 font-receipt text-3xl font-semibold tabular-nums">
                2{" "}
                <span className="text-base font-sans font-semibold text-[var(--muted)]">
                  pages
                </span>
              </p>
              <p className="mt-2 flex-1 text-sm text-[var(--muted)]">
                Friday bake · Market box
              </p>
              <span className="mt-4 inline-flex w-fit rounded-[var(--radius-pill)] bg-[var(--marigold)] px-4 py-2 text-sm font-semibold text-[var(--field)]">
                + New pre-order page
              </span>
            </div>
            <div className="dash-card flex min-h-[180px] flex-1 flex-col p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                Subscriptions
              </p>
              <p className="mt-3 font-receipt text-3xl font-semibold tabular-nums">
                1{" "}
                <span className="text-base font-sans font-semibold text-[var(--muted)]">
                  offer
                </span>
              </p>
              <p className="mt-2 flex-1 text-sm text-[var(--muted)]">
                14 live boxes
              </p>
              <span className="mt-4 inline-flex w-fit rounded-[var(--radius-pill)] bg-[var(--marigold)] px-4 py-2 text-sm font-semibold text-[var(--field)]">
                + New subscription
              </span>
            </div>
            <DashboardLowStockCard items={LOW_STOCK} />
          </div>

          <div className="dash-card overflow-hidden">
            <div className="border-b border-[var(--line)] px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                Recent orders
              </p>
            </div>
            <ul className="divide-y divide-[var(--line)]">
              {RECENT.map((order) => (
                <li
                  key={`${order.name}-${order.when}`}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[var(--field)]">
                      {order.name}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {order.method} · {order.when}
                    </p>
                  </div>
                  <p className="shrink-0 font-receipt font-semibold tabular-nums">
                    {formatMoney(order.total, currency)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
