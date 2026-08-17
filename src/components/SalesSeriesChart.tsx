"use client";

import { useMemo, useState } from "react";
import { formatMoney } from "@/lib/money";
import type {
  ChannelSalesSeries,
  SalesChannel,
  SeriesPoint,
} from "@/lib/sales-series";
import SalesChannelFilterBar, {
  CHANNEL_META,
} from "@/components/SalesChannelFilterBar";
import SalesSeriesChartPlot from "@/components/SalesSeriesChartPlot";

export default function SalesSeriesChart({
  points,
  previousPoints,
  channels,
  currency,
  title = "Sales over time",
}: {
  points?: SeriesPoint[];
  previousPoints?: SeriesPoint[];
  channels?: ChannelSalesSeries;
  currency: string;
  title?: string;
}) {
  const [mode, setMode] = useState<"all" | "channels">("all");
  const [enabled, setEnabled] = useState<Record<SalesChannel, boolean>>({
    subscription: true,
    preorder: true,
    stand: true,
  });

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

  const showPrevious =
    Boolean(previousPoints?.length) && mode === "all";
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

  function toggleChannel(key: SalesChannel) {
    if (mode === "all") {
      setMode("channels");
      setEnabled({
        subscription: key === "subscription",
        preorder: key === "preorder",
        stand: key === "stand",
      });
      return;
    }
    setEnabled((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (!next.subscription && !next.preorder && !next.stand) {
        return { ...prev, [key]: true };
      }
      return next;
    });
  }

  return (
    <div className="dash-card flex h-full flex-col p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-[var(--muted)]">
          Peak {formatMoney(peakCents, currency)}
        </p>
      </div>

      {channels ? (
        <SalesChannelFilterBar
          mode={mode}
          enabled={enabled}
          onAll={() => setMode("all")}
          onToggle={toggleChannel}
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
