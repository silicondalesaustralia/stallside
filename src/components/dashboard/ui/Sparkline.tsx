/** Tiny trend line for stats strips; no axes or labels. */
export default function Sparkline({ values }: { values: number[] }) {
  const w = 72;
  const h = 24;
  if (values.length < 2) return <span className="inline-block h-6 w-[72px]" aria-hidden />;
  const max = Math.max(...values, 1);
  const step = w / (values.length - 1);
  const points = values
    .map((v, i) => `${(i * step).toFixed(1)},${(h - 2 - (v / max) * (h - 4)).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke="var(--leaf)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
