import { formatMoney } from "@/lib/money";
import type { SeriesPoint } from "@/lib/sales-series";

function seriesCoords(
  points: SeriesPoint[],
  max: number,
  padX: number,
  padY: number,
  plotW: number,
  plotH: number,
) {
  return points.map((point, i) => {
    const x =
      points.length === 1
        ? padX + plotW / 2
        : padX + (i / (points.length - 1)) * plotW;
    const y = padY + plotH - (point.cents / max) * plotH;
    return { x, y, ...point };
  });
}

function pathFromCoords(
  coords: { x: number; y: number }[],
): string {
  return coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");
}

export default function SalesSeriesChart({
  points,
  previousPoints,
  currency,
  title = "Sales over time",
}: {
  points: SeriesPoint[];
  previousPoints?: SeriesPoint[];
  currency: string;
  title?: string;
}) {
  const compare = previousPoints && previousPoints.length > 0;
  const max = Math.max(
    ...points.map((p) => p.cents),
    ...(previousPoints?.map((p) => p.cents) ?? []),
    1,
  );
  const width = 640;
  const height = 180;
  const padX = 12;
  const padY = 16;
  const plotW = width - padX * 2;
  const plotH = height - padY * 2;

  const coords = seriesCoords(points, max, padX, padY, plotW, plotH);
  const prevCoords = compare
    ? seriesCoords(previousPoints, max, padX, padY, plotW, plotH)
    : [];

  const line = pathFromCoords(coords);
  const prevLine = pathFromCoords(prevCoords);
  const area = `${line} L ${coords[coords.length - 1]?.x ?? padX} ${padY + plotH} L ${padX} ${padY + plotH} Z`;
  const tickEvery = Math.max(1, Math.ceil(points.length / 6));
  const peakCents =
    max === 1 &&
    points.every((p) => p.cents === 0) &&
    (!previousPoints || previousPoints.every((p) => p.cents === 0))
      ? 0
      : max;

  return (
    <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-[var(--muted)]">
          Peak {formatMoney(peakCents, currency)}
        </p>
      </div>
      {compare ? (
        <div className="mb-3 flex flex-wrap gap-4 text-xs font-medium text-[var(--muted)]">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 rounded-full bg-[var(--leaf)]" />
            This period
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block h-0 w-4 border-t-2 border-dashed border-[var(--muted)]"
            />
            Previous period
          </span>
        </div>
      ) : null}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-44 w-full"
        role="img"
        aria-label={
          compare
            ? `${title} comparing this period with the previous period`
            : title
        }
      >
        <title>
          {compare
            ? `${title} — this period vs previous period`
            : title}
        </title>
        <path d={area} fill="var(--leaf)" opacity="0.12" />
        {compare && prevLine ? (
          <path
            d={prevLine}
            fill="none"
            stroke="var(--muted)"
            strokeWidth="2"
            strokeDasharray="5 4"
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity="0.85"
          />
        ) : null}
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
