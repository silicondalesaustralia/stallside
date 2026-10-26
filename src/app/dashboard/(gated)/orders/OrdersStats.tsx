import StatsStrip, { type StripStat } from "@/components/dashboard/ui/StatsStrip";
import { formatMoney } from "@/lib/money";
import { buildSalesSeries } from "@/lib/sales-series";

type MetricOrder = {
  totalCents: number;
  createdAt: Date;
  items: { quantity: number }[];
};

type Window = { start: Date; end: Date; label: string };

function itemsOf(orders: MetricOrder[]) {
  return orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
}

function trend(rows: { totalCents: number; createdAt: Date }[], window: Window, timeZone: string) {
  return buildSalesSeries(rows, window.start, window.end, timeZone).map((p) => p.cents);
}

/** Orders / items / sales / refunds for the selected range, vs the previous range. */
export default function OrdersStats({
  current,
  previous,
  refundedCents,
  currency,
  window,
  timeZone,
}: {
  current: MetricOrder[];
  previous: MetricOrder[];
  refundedCents: number;
  currency: string;
  window: Window;
  timeZone: string;
}) {
  const sales = current.reduce((sum, o) => sum + o.totalCents, 0);
  const prevSales = previous.reduce((sum, o) => sum + o.totalCents, 0);
  const items = itemsOf(current);
  const avg = current.length ? Math.round(sales / current.length) : 0;
  const prevAvg = previous.length ? Math.round(prevSales / previous.length) : 0;

  const stats: StripStat[] = [
    {
      label: "Orders",
      value: String(current.length),
      current: current.length,
      previous: previous.length,
      trend: trend(current.map((o) => ({ ...o, totalCents: 1 })), window, timeZone),
    },
    {
      label: "Items ordered",
      value: String(items),
      current: items,
      previous: itemsOf(previous),
      trend: trend(
        current.map((o) => ({ createdAt: o.createdAt, totalCents: itemsOf([o]) })),
        window,
        timeZone,
      ),
    },
    {
      label: "Sales",
      value: formatMoney(sales, currency),
      current: sales,
      previous: prevSales,
      trend: trend(current, window, timeZone),
    },
    {
      label: "Average order",
      value: formatMoney(avg, currency),
      current: avg,
      previous: prevAvg,
    },
    {
      label: "Refunds",
      value: formatMoney(refundedCents, currency),
      current: refundedCents,
    },
  ];

  return <StatsStrip stats={stats} period={window.label} />;
}
