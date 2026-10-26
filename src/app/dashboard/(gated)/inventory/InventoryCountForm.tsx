"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import DataTable, { cellClass, type DataColumn } from "@/components/dashboard/ui/DataTable";
import { applyStockCount } from "./inventory-actions";

type CountRow = { id: string; name: string; sku: string | null; stockQuantity: number };

const COLUMNS: DataColumn[] = [
  { label: "Product" },
  { label: "System", align: "right" },
  { label: "Counted", align: "right" },
  { label: "Variance", align: "right" },
];

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
      {rows.length === 0 ? (
        <div className="dash-card px-4 py-10 text-center text-sm text-[var(--muted)]">No products match.</div>
      ) : (
        <DataTable columns={COLUMNS} footer={`${rows.length} product${rows.length === 1 ? "" : "s"}`}>
          {rows.map((r) => {
            const raw = counts[r.id] ?? "";
            const variance = raw.trim() === "" ? null : Number(raw) - r.stockQuantity;
            return (
              <tr key={r.id} className="align-middle">
                <td className={cellClass(COLUMNS[0])}>
                  <p className="font-semibold">{r.name}</p>
                  {r.sku ? <p className="text-xs text-[var(--muted)]">SKU {r.sku}</p> : null}
                </td>
                <td className={`${cellClass(COLUMNS[1])} font-receipt whitespace-nowrap`}>{r.stockQuantity}</td>
                <td className={cellClass(COLUMNS[2])}>
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
                  className={`${cellClass(COLUMNS[3])} font-receipt whitespace-nowrap font-semibold ${
                    variance == null || variance === 0
                      ? "text-[var(--muted)]"
                      : variance < 0
                        ? "text-[var(--gone)]"
                        : "text-[var(--leaf-dark)]"
                  }`}
                >
                  {variance == null ? "—" : variance > 0 ? `+${variance}` : variance}
                </td>
              </tr>
            );
          })}
        </DataTable>
      )}
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
