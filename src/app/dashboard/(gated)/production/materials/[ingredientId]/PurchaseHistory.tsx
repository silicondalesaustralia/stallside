import { formatMoney } from "@/lib/money";
import { formatDay } from "@/lib/production/format";
import { formatQuantity, type Unit } from "@/lib/production/unit-convert";
import ActionForm from "../../ActionForm";
import { tdClass, thClass } from "../../form-styles";
import { deletePurchase } from "../purchase-actions";

export type PurchaseRow = {
  id: string;
  quantity: number;
  unit: Unit;
  totalCents: number;
  supplier: string | null;
  lotCode: string | null;
  expiresAt: Date | null;
  receivedAt: Date;
};

export default function PurchaseHistory({ rows, currency }: { rows: PurchaseRow[]; currency: string }) {
  if (rows.length === 0) {
    return <p className="text-sm text-[var(--muted)]">No purchases recorded yet.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--line)] bg-white">
      <table className="w-full min-w-[40rem] text-sm">
        <thead className="border-b border-[var(--line)]">
          <tr>
            <th className={thClass}>Received</th>
            <th className={`${thClass} text-right`}>Quantity</th>
            <th className={`${thClass} text-right`}>Paid</th>
            <th className={thClass}>Supplier</th>
            <th className={thClass}>Lot · expiry</th>
            <th className={thClass} />
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--line)]">
          {rows.map((p) => (
            <tr key={p.id}>
              <td className={tdClass}>{formatDay(p.receivedAt)}</td>
              <td className={`${tdClass} text-right tabular-nums`}>{formatQuantity(p.quantity, p.unit)}</td>
              <td className={`${tdClass} text-right tabular-nums`}>{formatMoney(p.totalCents, currency)}</td>
              <td className={tdClass}>{p.supplier ?? "—"}</td>
              <td className={`${tdClass} text-[var(--muted)]`}>
                {[p.lotCode, p.expiresAt ? `exp ${formatDay(p.expiresAt)}` : null].filter(Boolean).join(" · ") || "—"}
              </td>
              <td className={`${tdClass} text-right`}>
                <ActionForm
                  action={deletePurchase}
                  submitLabel="Remove"
                  variant="danger"
                  className="inline-flex"
                  confirmMessage="Remove this purchase and take its quantity back out of stock?"
                >
                  <input type="hidden" name="id" value={p.id} />
                </ActionForm>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
