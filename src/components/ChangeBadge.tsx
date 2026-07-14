export default function ChangeBadge({
  current,
  previous,
}: {
  current: number;
  previous: number;
}) {
  if (previous === 0 && current === 0) {
    return (
      <span className="mt-2 inline-flex rounded-full bg-[var(--wash)] px-2 py-0.5 text-xs font-semibold text-[var(--muted)]">
        0% vs prior
      </span>
    );
  }
  if (previous === 0) {
    return (
      <span className="mt-2 inline-flex rounded-full bg-[var(--ok)]/15 px-2 py-0.5 text-xs font-semibold text-[var(--ok)]">
        New vs prior
      </span>
    );
  }

  const pct = ((current - previous) / previous) * 100;
  const up = pct >= 0;
  const label = `${up ? "▲" : "▼"} ${Math.abs(pct).toFixed(0)}% vs prior`;

  return (
    <span
      className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
        up
          ? "bg-[var(--ok)]/15 text-[var(--ok)]"
          : "bg-[var(--gone)]/15 text-[var(--gone)]"
      }`}
    >
      {label}
    </span>
  );
}
