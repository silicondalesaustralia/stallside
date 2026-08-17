"use client";

import { useMemo } from "react";
import DashboardStat from "@/components/DashboardStat";
import PaymentMethodValue from "@/components/PaymentMethodValue";
import SalesSeriesChart from "@/components/SalesSeriesChart";
import { formatMoney } from "@/lib/money";
import {
  filterOrdersByChannels,
  summarizeOrders,
  type ChannelMetricRow,
} from "@/lib/order-metrics";
import { buildChannelSalesSeries } from "@/lib/sales-series";
import { useChannelFilter } from "@/lib/use-channel-filter";

export type SerializedChannelOrder = Omit<ChannelMetricRow, "createdAt"> & {
  createdAt: string;
};

function hydrate(orders: SerializedChannelOrder[]): ChannelMetricRow[] {
  return orders.map((o) => ({ ...o, createdAt: new Date(o.createdAt) }));
}

export default function SalesAnalyticsPanel({
  currentOrders,
  previousOrders,
  rangeStart,
  rangeEnd,
  prevStart,
  prevEnd,
  chartTitle,
  ordersHref,
  layout = "home",
}: {
  currentOrders: SerializedChannelOrder[];
  previousOrders: SerializedChannelOrder[];
  rangeStart: string;
  rangeEnd: string;
  prevStart: string;
  prevEnd: string;
  chartTitle: string;
  ordersHref?: string;
  layout?: "home" | "orders";
}) {
  const filter = useChannelFilter();
  const currentHydrated = useMemo(
    () => hydrate(currentOrders),
    [currentOrders],
  );
  const previousHydrated = useMemo(
    () => hydrate(previousOrders),
    [previousOrders],
  );

  const filteredCurrent = useMemo(
    () =>
      filterOrdersByChannels(currentHydrated, filter.mode, filter.enabled),
    [currentHydrated, filter.enabled, filter.mode],
  );
  const filteredPrevious = useMemo(
    () =>
      filterOrdersByChannels(previousHydrated, filter.mode, filter.enabled),
    [previousHydrated, filter.enabled, filter.mode],
  );

  const current = summarizeOrders(filteredCurrent);
  const previous = summarizeOrders(filteredPrevious);
  const channels = useMemo(
    () =>
      buildChannelSalesSeries(
        currentHydrated,
        new Date(rangeStart),
        new Date(rangeEnd),
      ),
    [currentHydrated, rangeEnd, rangeStart],
  );
  const previousSeries = useMemo(
    () =>
      buildChannelSalesSeries(
        previousHydrated,
        new Date(prevStart),
        new Date(prevEnd),
      ).all,
    [prevEnd, prevStart, previousHydrated],
  );

  const stats = (
    <>
      <DashboardStat
        label="Sales"
        href={ordersHref}
        value={formatMoney(current.salesCents, current.currency)}
        current={current.salesCents}
        previous={previous.salesCents}
      />
      <DashboardStat
        label="Orders"
        href={ordersHref}
        value={String(current.orderCount)}
        current={current.orderCount}
        previous={previous.orderCount}
      />
      <DashboardStat
        label="Payment Method"
        href={ordersHref}
        value={
          <PaymentMethodValue
            hasCash={current.hasCash}
            hasCheckout={current.hasCheckout}
          />
        }
      />
    </>
  );

  const chart = (
    <SalesSeriesChart
      channels={channels}
      previousPoints={previousSeries}
      currency={current.currency}
      title={chartTitle}
      filter={filter}
    />
  );

  if (layout === "orders") {
    return (
      <>
        <section className="grid grid-cols-3 gap-3">{stats}</section>
        {chart}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch">
      <div className="grid min-h-[154px] flex-[1.15] grid-cols-3 gap-3 sm:gap-4">
        {stats}
      </div>
      <div className="min-h-[154px] flex-1">{chart}</div>
    </div>
  );
}
