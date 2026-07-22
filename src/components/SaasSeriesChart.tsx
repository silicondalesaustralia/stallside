"use client";

import { useMemo, useState } from "react";
import {
  SAAS_METRICS,
  type SaasMetricKey,
  type SaasSeriesPoint,
} from "@/lib/saas-series";

function pathFromCoords(coords: { x: number; y: number }[]): string {
  if (!coords.length) return "";
  return coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");
}

export default function SaasSeriesChart({
  points,
  title = "SaaS activity over time",
}: {
  points: SaasSeriesPoint[];
  title?: string;
}) {
  const [visible, setVisible] = useState<Record<SaasMetricKey, boolean>>({
    owners: true,
    demos: true,
    invites: true,
  });

  const activeKeys = SAAS_METRICS.filter((m) => visible[m.key]).map((m) => m.key);
  const max = Math.max(
    1,
    ...points.flatMap((p) => activeKeys.map((key) => p[key])),
  );

  const width = 640;
  const height = 200;
  const padX = 12;
  const padY = 16;
  const plotW = width - padX * 2;
  const plotH = height - padY * 2;
  const tickEvery = Math.max(1, Math.ceil(points.length / 6));

  const lines = useMemo(() => {
    return SAAS_METRICS.filter((m) => visible[m.key]).map((metric) => {
      const coords = points.map((point, i) => {
        const x =
          points.length === 1
            ? padX + plotW / 2
            : padX + (i / (points.length - 1)) * plotW;
        const y = padY + plotH - (point[metric.key] / max) * plotH;
        return { x, y };
      });
      return { ...metric, d: pathFromCoords(coords) };
    });
  }, [points, visible, max, padX, padY, plotW, plotH]);

  function toggle(key: SaasMetricKey) {
    setVisible((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (!Object.values(next).some(Boolean)) return prev;
      return next;
    });
  }

  function showAll() {
    setVisible({ owners: true, demos: true, invites: true });
  }

  return (
    <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-[var(--muted)]">Peak {max}</p>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={showAll}
          className={`rounded-[var(--radius-pill)] px-3 py-1.5 text-sm font-semibold transition ${
            activeKeys.length === SAAS_METRICS.length
              ? "bg-[var(--field)] text-[var(--ink-on-dark)]"
              : "border border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--leaf)]"
          }`}
        >
          All metrics
        </button>
        {SAAS_METRICS.map((metric) => (
          <button
            key={metric.key}
            type="button"
            onClick={() => toggle(metric.key)}
            className={`inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3 py-1.5 text-sm font-semibold transition ${
              visible[metric.key]
                ? "border border-transparent bg-white text-[var(--ink)] shadow-sm ring-1 ring-[var(--line)]"
                : "border border-[var(--line)] bg-[var(--wash)] text-[var(--muted)]"
            }`}
          >
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ background: metric.color, opacity: visible[metric.key] ? 1 : 0.35 }}
              aria-hidden
            />
            {metric.label}
          </button>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-52 w-full"
        role="img"
        aria-label={title}
      >
        <title>{title}</title>
        {lines.map((line) => (
          <path
            key={line.key}
            d={line.d}
            fill="none"
            stroke={line.color}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
        {points.map((point, i) =>
          i % tickEvery === 0 || i === points.length - 1 ? (
            <text
              key={`${point.label}-${i}`}
              x={
                points.length === 1
                  ? padX + plotW / 2
                  : padX + (i / (points.length - 1)) * plotW
              }
              y={height - 2}
              textAnchor="middle"
              className="fill-[var(--muted)]"
              style={{ fontSize: 10 }}
            >
              {point.label}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  );
}
