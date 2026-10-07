export default function AdminConnectionFlag({ on, label }: { on: boolean; label: string }) {
  return (
    <span className={on ? "text-emerald-700" : "text-[var(--muted)]"}>
      {on ? "✓" : "–"} {label}
    </span>
  );
}
