type Props = { label: string; value: string; hint?: string };

export default function AdminUsageStat({ label, value, hint }: Props) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-white p-3">
      <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-[var(--muted)]">{hint}</p> : null}
    </div>
  );
}
