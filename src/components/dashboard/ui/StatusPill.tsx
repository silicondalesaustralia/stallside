export type PillTone = "neutral" | "success" | "attention" | "warning" | "info" | "critical";

const TONES: Record<PillTone, { pill: string; dot: string }> = {
  neutral: { pill: "bg-[var(--wash)] text-[var(--muted)]", dot: "bg-[var(--muted)]" },
  success: { pill: "bg-[var(--ok)]/12 text-[var(--leaf-dark)]", dot: "bg-[var(--ok)]" },
  attention: { pill: "bg-[var(--marigold)]/20 text-[var(--field)]", dot: "bg-[var(--marigold)]" },
  warning: { pill: "bg-[var(--warn)]/12 text-[var(--warn)]", dot: "bg-[var(--warn)]" },
  info: { pill: "bg-sky-100 text-sky-900", dot: "bg-sky-600" },
  critical: { pill: "bg-[var(--gone)]/10 text-[var(--gone)]", dot: "bg-[var(--gone)]" },
};

export type PillSpec = { label: string; tone: PillTone };

/** Compact status pill with a leading dot, used in dashboard tables and detail headers. */
export default function StatusPill({ label, tone }: PillSpec) {
  const t = TONES[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${t.pill}`}
    >
      <span aria-hidden className={`size-1.5 rounded-full ${t.dot}`} />
      {label}
    </span>
  );
}
