"use client";

import { useMemo, useState } from "react";
import type { LedgerRow } from "@/lib/owner-payment-ledger";

export default function PaymentLedgerTable({ rows }: { rows: LedgerRow[] }) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const shown = useMemo(
    () => (needle ? rows.filter((row) => row.search.includes(needle)) : rows),
    [needle, rows],
  );

  return (
    <div className="flex flex-col gap-3">
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search date, order, invoice, amount"
        aria-label="Search payments"
        className="w-full max-w-md rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
      />
      {shown.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          {rows.length === 0
            ? "No transaction fees or subscription payments yet."
            : "No payments match that search."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-xs uppercase tracking-wide text-[var(--muted)]">
                <th className="py-2 pr-3 font-medium">Date</th>
                <th className="py-2 pr-3 font-medium">Type</th>
                <th className="py-2 pr-3 font-medium">Reference</th>
                <th className="py-2 pr-3 font-medium">Detail</th>
                <th className="py-2 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((row) => (
                <tr key={row.id} className="border-b border-[var(--line)]">
                  <td className="py-2 pr-3 whitespace-nowrap">{row.at}</td>
                  <td className="py-2 pr-3">{row.kind}</td>
                  <td className="py-2 pr-3">
                    <code className="text-xs">{row.reference}</code>
                  </td>
                  <td className="py-2 pr-3">{row.detail}</td>
                  <td className="py-2 tabular-nums">{row.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-[var(--muted)]">
        Showing {shown.length} of {rows.length}
      </p>
    </div>
  );
}
