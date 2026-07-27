import ChangeBadge from "@/components/ChangeBadge";

export default function DashboardStat({
  label,
  value,
  current,
  previous,
}: {
  label: string;
  value: string;
  current?: number;
  previous?: number;
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-3 py-4 sm:px-4 sm:py-5">
      <p className="truncate text-[0.65rem] uppercase tracking-wide text-[var(--muted)] sm:text-xs">
        {label}
      </p>
      <p className="mt-2 break-words font-receipt text-lg font-semibold leading-tight tracking-tight tabular-nums sm:text-2xl lg:text-3xl">
        {value}
      </p>
      {typeof current === "number" && typeof previous === "number" ? (
        <ChangeBadge current={current} previous={previous} />
      ) : null}
    </div>
  );
}
