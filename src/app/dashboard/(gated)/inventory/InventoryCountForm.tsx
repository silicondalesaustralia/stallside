"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { applyStockCount } from "./inventory-actions";

type CountRow = { id: string; name: string; sku: string | null; stockQuantity: number };

const th = "px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]";

export default function InventoryCountForm({ rows }: { rows: CountRow[] }) {
  const router = useRouter();
  const [counts, setCounts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const entered = rows.filter((r) => (counts[r.id] ?? "").trim() !== "");
  const variances = entered.filter((r) => Number(counts[r.id]) !== r.stockQuantity);

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await applyStockCount(formData);
      if ("error" in result) {
        setMessage(result.error);
        return;
      }
      setCounts({});
      setMessage(`Saved. ${result.changed ?? 0} product(s) adjusted.`);
      router.refresh();
    });
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-xl border border-[var(--line)] bg-white">
        <table className="w-full min-w-[36rem] text-sm">
          <thead className="border-b border-[var(--line)]">
            <tr>
              <th className={th}>Product</th>
              <th className={`${th} text-right`}>System</th>
              <th className={`${th} text-right`}>Counted</th>
              <th className={`${th} text-right`}>Variance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {rows.map((r) => {
              const raw = counts[r.id] ?? "";
              const variance = raw.trim() === "" ? null : Number(raw) - r.stockQuantity;
              return (
                <tr key={r.id}>
                  <td className="px-3 py-2">
                    <p className="font-semibold">{r.name}</p>
                    {r.sku ? <p className="text-xs text-[var(--muted)]">SKU {r.sku}</p> : null}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.stockQuantity}</td>
                  <td className="px-3 py-2 text-right">
                    <input
                      name={`count:${r.id}`}
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={raw}
                      onChange={(e) => setCounts((c) => ({ ...c, [r.id]: e.target.value }))}
                      className="w-24 rounded-lg border border-[var(--line)] px-2 py-1.5 text-right tabular-nums"
                      aria-label={`Counted quantity for ${r.name}`}
                    />
                  </td>
                  <td
                    className={`px-3 py-2 text-right font-semibold tabular-nums ${
                      variance == null || variance === 0
                        ? "text-[var(--muted)]"
                        : variance < 0
                          ? "text-red-700"
                          : "text-[var(--leaf-dark)]"
                    }`}
                  >
                    {variance == null ? "—" : variance > 0 ? `+${variance}` : variance}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending || entered.length === 0}
          className="rounded-lg bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-60"
        >
          {pending ? "Saving…" : "Apply count"}
        </button>
        <p className="text-sm text-[var(--muted)]">
          {message ??
            `${entered.length} counted · ${variances.length} with a variance. Blank rows are skipped.`}
        </p>
      </div>
    </form>
  );
}
