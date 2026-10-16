"use client";

import { useMemo, useState } from "react";
import { QR_TARGET_GROUPS, qrTargetKey, type QrTarget, type QrTargetOption } from "@/lib/qr/target-types";

const PER_GROUP = 40;

export default function QrTargetPicker({
  options,
  value,
  onChange,
}: {
  options: QrTargetOption[];
  value: QrTarget | null;
  onChange: (option: QrTargetOption) => void;
}) {
  const [query, setQuery] = useState("");
  const selectedKey = value ? qrTargetKey(value) : null;
  const selected = options.find((o) => qrTargetKey(o) === selectedKey) ?? null;

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? options.filter((o) => o.label.toLowerCase().includes(q) || o.path.toLowerCase().includes(q))
      : options;
    return QR_TARGET_GROUPS.map((group) => {
      const items = matches.filter((o) => o.group === group);
      return { group, items: items.slice(0, PER_GROUP), hidden: Math.max(0, items.length - PER_GROUP) };
    }).filter((g) => g.items.length > 0);
  }, [options, query]);

  return (
    <div className="flex flex-col gap-2">
      {selected ? (
        <p className="text-sm">
          Opens <span className="font-semibold">{selected.label}</span>{" "}
          <span className="text-[var(--muted)]">({selected.path})</span>
        </p>
      ) : null}
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search pages, categories, products, menus…"
        aria-label="Search pages"
        className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm"
      />
      <div className="max-h-72 overflow-y-auto rounded-lg border border-[var(--line)] bg-white">
        {groups.length === 0 ? (
          <p className="p-3 text-sm text-[var(--muted)]">No pages match “{query}”.</p>
        ) : null}
        {groups.map(({ group, items, hidden }) => (
          <div key={group}>
            <p className="sticky top-0 bg-[var(--surface-2,#f6f6f4)] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              {group}
            </p>
            <ul>
              {items.map((o) => {
                const key = qrTargetKey(o);
                const active = key === selectedKey;
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => onChange(o)}
                      aria-pressed={active}
                      className={`flex w-full items-baseline justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-black/5 ${active ? "bg-[var(--accent-soft,#e8f3ec)] font-semibold" : ""}`}
                    >
                      <span className="truncate">{o.label}</span>
                      <span className="shrink-0 truncate text-xs text-[var(--muted)]">{o.path}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {hidden > 0 ? (
              <p className="px-3 py-1.5 text-xs text-[var(--muted)]">{hidden} more — search to narrow down.</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
