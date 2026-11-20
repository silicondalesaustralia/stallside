import { HOME_SCREEN_CAPTION } from "@/components/home/home-styles";

/** Browser chrome around a dashboard / UI mock. */
export function FeatureChrome({
  path,
  children,
  caption,
}: {
  path: string;
  children: React.ReactNode;
  caption: string;
}) {
  return (
    <div>
      <div
        aria-hidden
        className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--wash)] shadow-[0_8px_25px_#17361f16]"
      >
        <div className="flex items-center gap-2 border-b border-[var(--line)] bg-[var(--panel)] px-3 py-2.5">
          <span className="size-2.5 rounded-full bg-[var(--gone)]/80" />
          <span className="size-2.5 rounded-full bg-[var(--marigold)]" />
          <span className="size-2.5 rounded-full bg-[var(--leaf)]" />
          <span className="ml-2 truncate font-mono text-[10px] text-[var(--muted)] sm:text-[11px]">
            vendl.app{path}
          </span>
        </div>
        <div className="bg-white p-3 sm:p-4">{children}</div>
      </div>
      <span className={HOME_SCREEN_CAPTION}>{caption}</span>
    </div>
  );
}

export function DashRow({
  label,
  meta,
  tone = "ok",
}: {
  label: string;
  meta: string;
  tone?: "ok" | "warn" | "mute";
}) {
  const toneClass =
    tone === "warn"
      ? "bg-[#fef3c7] text-[#92400e]"
      : tone === "mute"
        ? "bg-[var(--wash)] text-[var(--muted)]"
        : "bg-[#ecfdf5] text-[#065f46]";
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] py-2.5 last:border-0">
      <span className="truncate text-sm font-medium text-[var(--field)]">{label}</span>
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${toneClass}`}>{meta}</span>
    </div>
  );
}
