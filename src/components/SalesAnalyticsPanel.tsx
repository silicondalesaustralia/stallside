"use client";

import { useMemo } from "react";
import DashboardStat from "@/components/DashboardStat";
import PaymentMethodValue from "@/components/PaymentMethodValue";
import SalesSeriesChart from "@/components/SalesSeriesChart";
import { formatMoney } from "@/lib/money";
import {
  mergeChannelSummaries,
  type ChannelSummaries,
} from "@/lib/order-metrics";
import { PROFIT_COGS_CAVEAT } from "@/lib/order-profit";
import type { ChannelSalesSeries, SeriesPoint } from "@/lib/sales-series";
import { useChannelFilter } from "@/lib/use-channel-filter";

export default function SalesAnalyticsPanel({
  channels,
  previousPoints,
  currentSummaries,
  previousSummaries,
  chartTitle,
  ordersHref,
  profitHref,
  profit,
  layout = "home",
}: {
  channels: ChannelSalesSeries;
  previousPoints: SeriesPoint[];
  currentSummaries: ChannelSummaries;
  previousSummaries: ChannelSummaries;
  chartTitle: string;
  ordersHref?: string;
  profitHref?: string;
  profit?: { currentCents: number; previousCents: number; costIncomplete: boolean };
  layout?: "home" | "orders";
}) {
  const filter = useChannelFilter();

  const current = useMemo(
    () => mergeChannelSummaries(currentSummaries, filter.mode, filter.enabled),
    [currentSummaries, filter.enabled, filter.mode],
  );
  const previous = useMemo(
    () => mergeChannelSummaries(previousSummaries, filter.mode, filter.enabled),
    [previousSummaries, filter.enabled, filter.mode],
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
      {profit ? (
        <DashboardStat
          label="Profit"
          href={profitHref}
          tip={PROFIT_COGS_CAVEAT}
          value={formatMoney(profit.currentCents, current.currency)}
          current={profit.currentCents}
          previous={profit.previousCents}
        />
      ) : null}
      <DashboardStat
        label="Payment Method"
        href={ordersHref}
        value={
          <PaymentMethodValue
            cashOrderCount={current.cashOrderCount}
            checkoutOrderCount={current.checkoutOrderCount}
          />
        }
      />
    </>
  );

  const chart = (
    <SalesSeriesChart
      channels={channels}
      previousPoints={previousPoints}
      currency={current.currency}
      title={chartTitle}
      filter={filter}
    />
  );

  const cols = profit ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3";

  if (layout === "orders") {
    return (
      <>
        <section className={`grid min-w-0 gap-2 sm:gap-3 ${cols}`}>{stats}</section>
        {chart}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch">
      <div className={`grid min-h-[154px] min-w-0 flex-[1.15] gap-2 sm:gap-4 ${cols}`}>
        {stats}
      </div>
      <div className="min-h-[154px] flex-1">{chart}</div>
    </div>
  );
}
