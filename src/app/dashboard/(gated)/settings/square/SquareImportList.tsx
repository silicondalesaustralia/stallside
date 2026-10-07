"use client";

import { formatMoney } from "@/lib/money";
import type { SquareImportRow } from "./import-actions";

export default function SquareImportList({
  rows,
  selected,
  onChange,
  currency,
}: {
  rows: SquareImportRow[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  currency: string;
}) {
  const allOn = selected.size === rows.length;

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        className="text-xs font-semibold underline"
        onClick={() => onChange(allOn ? new Set() : new Set(rows.map((r) => r.variationId)))}
      >
        {allOn ? "Select none" : "Select all"}
      </button>
      <ul className="max-h-80 space-y-1 overflow-y-auto rounded-xl border border-[var(--line)] p-2">
        {rows.map((r) => (
          <li key={r.variationId}>
            <label className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[var(--wash)]">
              <input
                type="checkbox"
                checked={selected.has(r.variationId)}
                onChange={() => toggle(r.variationId)}
              />
              <span className="flex-1">
                {r.name}
                {r.sku ? <span className="text-[var(--muted)]"> · {r.sku}</span> : null}
              </span>
              <span className="text-xs text-[var(--muted)]">
                {r.priceCents == null ? "Price set at sale" : formatMoney(r.priceCents, currency)}
                {" · "}
                {r.stock == null ? "stock not tracked" : `${r.stock} in stock`}
                {r.hasImage ? " · photo" : ""}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
