import type { ImportLine } from "@/lib/inventory/stock-import";

const th = "px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]";

export default function InventoryImportPreview({ lines }: { lines: ImportLine[] }) {
  return (
    <div className="max-h-[28rem] overflow-auto rounded-xl border border-[var(--line)] bg-white">
      <table className="w-full min-w-[36rem] text-sm">
        <thead className="sticky top-0 border-b border-[var(--line)] bg-white">
          <tr>
            <th className={th}>Row</th>
            <th className={th}>Product</th>
            <th className={`${th} text-right`}>Now</th>
            <th className={`${th} text-right`}>New</th>
            <th className={`${th} text-right`}>Change</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--line)]">
          {lines.map((l) => {
            const diff = l.next != null && l.current != null ? l.next - l.current : null;
            return (
              <tr key={l.line} className={l.issue ? "bg-red-50" : undefined}>
                <td className="px-3 py-2 tabular-nums text-[var(--muted)]">{l.line}</td>
                <td className="px-3 py-2">
                  <p className="font-semibold">{l.name ?? l.label}</p>
                  {l.issue ? <p className="text-xs text-red-700">{l.issue}</p> : null}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{l.current ?? "—"}</td>
                <td className="px-3 py-2 text-right tabular-nums">{l.issue ? "—" : l.next}</td>
                <td
                  className={`px-3 py-2 text-right font-semibold tabular-nums ${
                    l.issue || !diff
                      ? "text-[var(--muted)]"
                      : diff < 0
                        ? "text-red-700"
                        : "text-[var(--leaf-dark)]"
                  }`}
                >
                  {l.issue ? "Skipped" : diff == null || diff === 0 ? "—" : diff > 0 ? `+${diff}` : diff}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
