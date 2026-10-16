import type { ReactNode } from "react";

type Props = {
  headers: string[];
  rows: { key: string; cells: ReactNode[] }[];
  empty: string;
};

export default function AdminUsageTable({ headers, rows, empty }: Props) {
  if (rows.length === 0) return <p className="text-sm text-[var(--muted)]">{empty}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--line)] text-xs uppercase tracking-wide text-[var(--muted)]">
            {headers.map((h) => (
              <th key={h} className="py-2 pr-3 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-b border-[var(--line)]">
              {row.cells.map((cell, i) => (
                <td key={headers[i] ?? i} className="py-2 pr-3 tabular-nums">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
