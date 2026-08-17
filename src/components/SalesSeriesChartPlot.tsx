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

function pathFromCoords(coords: { x: number; y: number }[]): string {
  return coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");
}

export default function SalesSeriesChartPlot({
  title,
  lines,
  previousPoints,
  showArea,
}: {
  title: string;
  lines: { key: string; color: string; points: SeriesPoint[] }[];
  previousPoints?: SeriesPoint[];
  showArea: boolean;
}) {
  const labelPoints = lines[0]?.points ?? [];
  const max = Math.max(
    ...lines.flatMap((l) => l.points.map((p) => p.cents)),
    ...(previousPoints?.map((p) => p.cents) ?? []),
    1,
  );
  const width = 640;
  const height = 180;
  const padX = 12;
  const padY = 16;
  const plotW = width - padX * 2;
  const plotH = height - padY * 2;
  const tickEvery = Math.max(1, Math.ceil(labelPoints.length / 6));
  const primaryCoords = seriesCoords(
    labelPoints,
    max,
    padX,
    padY,
    plotW,
    plotH,
  );
  const area =
    primaryCoords.length > 0
      ? `${pathFromCoords(primaryCoords)} L ${primaryCoords[primaryCoords.length - 1]?.x ?? padX} ${padY + plotH} L ${padX} ${padY + plotH} Z`
      : "";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-44 w-full"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      {area && showArea ? (
        <path d={area} fill="var(--leaf)" opacity="0.12" />
      ) : null}
      {previousPoints?.length ? (
        <path
          d={pathFromCoords(
            seriesCoords(previousPoints, max, padX, padY, plotW, plotH),
          )}
          fill="none"
          stroke="var(--muted)"
          strokeWidth="2"
          strokeDasharray="5 4"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity="0.85"
        />
      ) : null}
      {lines.map((line) => (
        <path
          key={line.key}
          d={pathFromCoords(
            seriesCoords(line.points, max, padX, padY, plotW, plotH),
          )}
          fill="none"
          stroke={line.color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}
      {primaryCoords.map((c, i) =>
        i % tickEvery === 0 || i === primaryCoords.length - 1 ? (
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
  );
}
