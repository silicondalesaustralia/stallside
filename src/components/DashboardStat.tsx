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
    <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-4 py-5">
      <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{label}</p>
      <p className="mt-2 font-receipt text-2xl font-semibold tracking-tight sm:text-3xl">
        {value}
      </p>
      {typeof current === "number" && typeof previous === "number" ? (
        <ChangeBadge current={current} previous={previous} />
      ) : null}
    </div>
  );
}
