"use client";

import type { DraftVariant } from "@/lib/product-variants/variant-draft";

const input = "w-full rounded-lg border border-[var(--line)] bg-white px-2 py-1.5 text-sm";

export default function VariantRowsTable({
  rows,
  onChange,
}: {
  rows: DraftVariant[];
  onChange: (rows: DraftVariant[]) => void;
}) {
  function update(i: number, patch: Partial<DraftVariant>) {
    onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  }

  if (rows.length === 0) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[32rem] text-sm">
        <thead>
          <tr className="text-left text-[var(--muted)]">
            <th className="py-2 pr-2 font-medium">Variant</th>
            <th className="w-28 py-2 pr-2 font-medium">Price</th>
            <th className="w-32 py-2 pr-2 font-medium">SKU</th>
            <th className="w-24 py-2 pr-2 font-medium">Stock</th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.values.join("|")} className="border-t border-[var(--line)]">
              <td className="py-2 pr-2 font-medium">{row.values.join(" / ")}</td>
              <td className="py-2 pr-2">
                <input
                  value={row.price}
                  inputMode="decimal"
                  onChange={(e) => update(i, { price: e.target.value })}
                  className={input}
                />
              </td>
              <td className="py-2 pr-2">
                <input
                  value={row.sku}
                  maxLength={64}
                  onChange={(e) => update(i, { sku: e.target.value })}
                  className={input}
                />
              </td>
              <td className="py-2 pr-2">
                <input
                  value={row.stock}
                  inputMode="numeric"
                  onChange={(e) => update(i, { stock: e.target.value })}
                  className={input}
                />
              </td>
              <td className="py-2">
                <button
                  type="button"
                  aria-label={`Remove ${row.values.join(" / ")}`}
                  onClick={() => onChange(rows.filter((_, j) => j !== i))}
                  className="text-[var(--gone)]"
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
