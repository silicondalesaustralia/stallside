export default function CustomerStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="dash-card px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
