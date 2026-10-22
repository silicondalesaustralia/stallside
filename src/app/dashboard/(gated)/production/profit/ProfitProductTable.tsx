import Link from "next/link";
import { formatMoney } from "@/lib/money";
import type { ProfitProductRow } from "@/lib/production/load-profit";
import { formatPercent, marginPercent } from "@/lib/production/pricing";
import { tdClass, thClass } from "../form-styles";

export default function ProfitProductTable({ rows, currency }: { rows: ProfitProductRow[]; currency: string }) {
  if (rows.length === 0) {
    return <p className="text-sm text-[var(--muted)]">No sales in this period.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--line)] bg-white">
      <table className="w-full min-w-[40rem] text-sm">
        <thead className="border-b border-[var(--line)]">
          <tr>
            <th className={thClass}>Product</th>
            <th className={`${thClass} text-right`}>Units</th>
            <th className={`${thClass} text-right`}>Revenue</th>
            <th className={`${thClass} text-right`}>Cost</th>
            <th className={`${thClass} text-right`}>Profit</th>
            <th className={`${thClass} text-right`}>Margin</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--line)]">
          {rows.map((r) => {
            const profit = r.revenueCents - r.costCents;
            const margin = marginPercent(r.revenueCents, profit);
            return (
              <tr key={r.productId}>
                <td className={tdClass}>
                  <Link href={`/dashboard/products/${r.productId}`} className="font-semibold hover:underline">
                    {r.name}
                  </Link>
                  {r.unknownCostUnits > 0 ? (
                    <p className="text-xs text-amber-700">
                      {r.unknownCostUnits} unit(s) without a cost. Set one on the product or record a batch.
                    </p>
                  ) : null}
                </td>
                <td className={`${tdClass} text-right tabular-nums`}>{r.units}</td>
                <td className={`${tdClass} text-right tabular-nums`}>{formatMoney(r.revenueCents, currency)}</td>
                <td className={`${tdClass} text-right tabular-nums`}>{formatMoney(r.costCents, currency)}</td>
                <td className={`${tdClass} text-right tabular-nums ${profit < 0 ? "text-red-700" : ""}`}>
                  {formatMoney(profit, currency)}
                </td>
                <td className={`${tdClass} text-right tabular-nums`}>{formatPercent(margin)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
