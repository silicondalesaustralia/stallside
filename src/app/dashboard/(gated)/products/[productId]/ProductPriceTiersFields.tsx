"use client";

import { useState } from "react";
import type { PriceTier } from "@/lib/price-tiers";

const emptyRow = () => ({ qty: "2", total: "" });

export default function ProductPriceTiersFields({
  currency,
  initial,
  disabled,
}: {
  currency: string;
  initial: PriceTier[];
  disabled?: boolean;
}) {
  const [rows, setRows] = useState(
    initial.length
      ? initial.map((t) => ({
          qty: String(t.qty),
          total: (t.totalCents / 100).toFixed(2),
        }))
      : [emptyRow()],
  );

  const tiers: PriceTier[] = [];
  for (const r of rows) {
    const qty = Number.parseInt(r.qty, 10);
    if (!Number.isInteger(qty) || qty < 1 || !r.total.trim()) continue;
    const totalCents = Math.round(Number.parseFloat(r.total) * 100);
    if (!Number.isFinite(totalCents) || totalCents < 0) continue;
    tiers.push({ qty, totalCents });
  }

  return (
    <fieldset
      disabled={disabled}
      className="flex flex-col gap-2 rounded-lg border border-[var(--line)] p-3"
    >
      <legend className="px-1 text-sm font-medium">Volume prices (optional)</legend>
      <p className="text-xs text-[var(--muted)]">
        Exact quantity totals, e.g. 2 for $9. Not available with product options.
      </p>
      <input type="hidden" name="priceTiersJson" value={JSON.stringify(tiers)} />
      {rows.map((row, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2 text-sm">
          <label className="flex items-center gap-1">
            Qty
            <input
              type="number"
              min={1}
              max={99}
              value={row.qty}
              onChange={(e) => {
                const next = [...rows];
                next[i] = { ...row, qty: e.target.value };
                setRows(next);
              }}
              className="w-16 rounded border border-[var(--line)] px-2 py-1"
            />
          </label>
          <label className="flex items-center gap-1">
            Total ({currency})
            <input
              inputMode="decimal"
              value={row.total}
              onChange={(e) => {
                const next = [...rows];
                next[i] = { ...row, total: e.target.value };
                setRows(next);
              }}
              placeholder="9.00"
              className="w-24 rounded border border-[var(--line)] px-2 py-1"
            />
          </label>
          {rows.length > 1 ? (
            <button
              type="button"
              className="text-[var(--muted)] underline"
              onClick={() => setRows(rows.filter((_, j) => j !== i))}
            >
              Remove
            </button>
          ) : null}
        </div>
      ))}
      {rows.length < 6 ? (
        <button
          type="button"
          className="self-start text-sm text-[var(--leaf-dark)] underline"
          onClick={() => setRows([...rows, emptyRow()])}
        >
          Add tier
        </button>
      ) : null}
    </fieldset>
  );
}
