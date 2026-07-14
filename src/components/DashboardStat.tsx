export default function DashboardStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-4 py-5">
      <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{label}</p>
      <p className="mt-2 font-receipt text-2xl font-semibold tracking-tight sm:text-3xl">
        {value}
      </p>
    </div>
  );
}
