"use client";

import SalesChannelFilterBar, {
  CHANNEL_META,
} from "@/components/SalesChannelFilterBar";
import SalesSeriesChartPlot from "@/components/SalesSeriesChartPlot";
import { formatMoney } from "@/lib/money";
import type { ChannelFilterMode } from "@/lib/use-channel-filter";
import type {
  ChannelSalesSeries,
  SalesChannel,
  SeriesPoint,
} from "@/lib/sales-series";
import { useMemo } from "react";

type FilterControls = {
  mode: ChannelFilterMode;
  enabled: Record<SalesChannel, boolean>;
  setAll: () => void;
  toggleChannel: (key: SalesChannel) => void;
};

export default function SalesSeriesChart({
  points,
  previousPoints,
  channels,
  currency,
  title = "Sales over time",
  filter,
}: {
  points?: SeriesPoint[];
  previousPoints?: SeriesPoint[];
  channels?: ChannelSalesSeries;
  currency: string;
  title?: string;
  filter?: FilterControls;
}) {
  const mode = filter?.mode ?? "all";
  const enabled = filter?.enabled ?? {
    subscription: true,
    preorder: true,
    stand: true,
  };

  const activeLines = useMemo(() => {
    if (!channels) {
      return [{ key: "all", color: "var(--leaf)", points: points ?? [] }];
    }
    if (mode === "all") {
      return [{ key: "all", color: "var(--leaf)", points: channels.all }];
    }
    return CHANNEL_META.filter((c) => enabled[c.key]).map((c) => ({
      key: c.key,
      color: c.color,
      points: channels[c.key],
    }));
  }, [channels, enabled, mode, points]);

  const showPrevious = Boolean(previousPoints?.length) && mode === "all";
  const max = Math.max(
    ...activeLines.flatMap((l) => l.points.map((p) => p.cents)),
    ...(showPrevious && previousPoints
      ? previousPoints.map((p) => p.cents)
      : []),
    1,
  );
  const peakCents =
    max === 1 && activeLines.every((l) => l.points.every((p) => p.cents === 0))
      ? 0
      : max;

  return (
    <div className="dash-card flex h-full flex-col p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-[var(--muted)]">
          Peak {formatMoney(peakCents, currency)}
        </p>
      </div>

      {channels && filter ? (
        <SalesChannelFilterBar
          mode={mode}
          enabled={enabled}
          onAll={filter.setAll}
          onToggle={filter.toggleChannel}
        />
      ) : null}

      {mode === "channels" && channels ? (
        <div className="mb-3 flex flex-wrap gap-3 text-xs font-medium text-[var(--muted)]">
          {CHANNEL_META.filter((c) => enabled[c.key]).map((c) => (
            <span key={c.key} className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-0.5 w-4 rounded-full"
                style={{ background: c.color }}
              />
              {c.label}
            </span>
          ))}
        </div>
      ) : null}

      <SalesSeriesChartPlot
        title={title}
        lines={activeLines}
        previousPoints={showPrevious ? previousPoints : undefined}
        showArea={mode === "all"}
      />
    </div>
  );
}
