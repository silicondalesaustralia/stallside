import { formatMoney } from "@/lib/money";
import type { SeriesPoint } from "@/lib/sales-series";

export default function SalesSeriesChart({
  points,
  currency,
}: {
  points: SeriesPoint[];
  currency: string;
}) {
  const max = Math.max(...points.map((p) => p.cents), 1);
  const width = 640;
  const height = 180;
  const padX = 12;
  const padY = 16;
  const plotW = width - padX * 2;
  const plotH = height - padY * 2;

  const coords = points.map((point, i) => {
    const x =
      points.length === 1
        ? padX + plotW / 2
        : padX + (i / (points.length - 1)) * plotW;
    const y = padY + plotH - (point.cents / max) * plotH;
    return { x, y, ...point };
  });

  const line = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L ${coords[coords.length - 1]?.x ?? padX} ${padY + plotH} L ${padX} ${padY + plotH} Z`;
  const tickEvery = Math.max(1, Math.ceil(points.length / 6));

  return (
    <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold">Sales over time</h2>
        <p className="text-sm text-[var(--muted)]">
          Peak {formatMoney(max === 1 && points.every((p) => p.cents === 0) ? 0 : max, currency)}
        </p>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full" role="img">
        <title>Sales time series</title>
        <path d={area} fill="var(--leaf)" opacity="0.12" />
        <path
          d={line}
          fill="none"
          stroke="var(--leaf)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {coords.map((c, i) =>
          i % tickEvery === 0 || i === coords.length - 1 ? (
            <text
              key={c.label + i}
              x={c.x}
              y={height - 2}
              textAnchor="middle"
              className="fill-[var(--muted)]"
              style={{ fontSize: 10 }}
            >
              {c.label}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  );
}
