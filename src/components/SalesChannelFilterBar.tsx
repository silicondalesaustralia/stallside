"use client";

import type { SalesChannel } from "@/lib/sales-series";

const CHANNEL_META: {
  key: SalesChannel;
  label: string;
  color: string;
}[] = [
  { key: "subscription", label: "Subscriptions", color: "var(--leaf)" },
  { key: "preorder", label: "Pre-Orders", color: "var(--marigold)" },
  { key: "stand", label: "Paid At Stand", color: "var(--field)" },
];

export { CHANNEL_META };

function Pill({
  active,
  label,
  color,
  onClick,
}: {
  active: boolean;
  label: string;
  color?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition ${
        active
          ? "bg-[var(--field)] text-[var(--ink-on-dark)]"
          : "bg-[var(--wash)] text-[var(--muted)] hover:bg-[var(--line)]/50"
      }`}
    >
      {color ? (
        <span
          className="size-2 rounded-full"
          style={{ background: color }}
          aria-hidden
        />
      ) : null}
      {label}
    </button>
  );
}

export default function SalesChannelFilterBar({
  mode,
  enabled,
  onAll,
  onToggle,
}: {
  mode: "all" | "channels";
  enabled: Record<SalesChannel, boolean>;
  onAll: () => void;
  onToggle: (key: SalesChannel) => void;
}) {
  return (
    <div className="mb-3 flex flex-wrap gap-2">
      <Pill active={mode === "all"} label="All sales" onClick={onAll} />
      {CHANNEL_META.map((c) => (
        <Pill
          key={c.key}
          active={mode === "channels" && enabled[c.key]}
          label={c.label}
          color={c.color}
          onClick={() => onToggle(c.key)}
        />
      ))}
    </div>
  );
}
