export default function ChangeBadge({
  current,
  previous,
}: {
  current: number;
  previous: number;
}) {
  if (previous === 0 && current === 0) {
    return (
      <span className="mt-2 inline-flex max-w-full truncate rounded-full bg-[var(--wash)] px-1.5 py-0.5 text-[0.65rem] font-semibold text-[var(--muted)] sm:px-2 sm:text-xs">
        0% vs prior
      </span>
    );
  }
  if (previous === 0) {
    return (
      <span className="mt-2 inline-flex max-w-full truncate rounded-full bg-[var(--ok)]/15 px-1.5 py-0.5 text-[0.65rem] font-semibold text-[var(--ok)] sm:px-2 sm:text-xs">
        New vs prior
      </span>
    );
  }

  const pct = ((current - previous) / previous) * 100;
  const up = pct >= 0;
  const label = `${up ? "▲" : "▼"} ${Math.abs(pct).toFixed(0)}% vs prior`;

  return (
    <span
      className={`mt-2 inline-flex max-w-full truncate rounded-full px-1.5 py-0.5 text-[0.65rem] font-semibold sm:px-2 sm:text-xs ${
        up
          ? "bg-[var(--ok)]/15 text-[var(--ok)]"
          : "bg-[var(--gone)]/15 text-[var(--gone)]"
      }`}
    >
      {label}
    </span>
  );
}
