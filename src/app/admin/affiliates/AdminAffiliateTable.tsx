import Link from "next/link";
import type { AdminAffiliateRow } from "@/lib/affiliate/load-admin-affiliates";
import { formatTotals, totalsAreEmpty } from "@/lib/affiliate/currency-totals";
import MarkAffiliatePaidForm from "./MarkAffiliatePaidForm";

export default function AdminAffiliateTable({ rows }: { rows: AdminAffiliateRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="dash-card p-5 text-sm text-[var(--muted)]">
        No affiliates yet. Links are created when a Pro member opens Referrals.
      </p>
    );
  }
  return (
    <section className="dash-card overflow-x-auto p-0">
      <table className="w-full min-w-[60rem] text-left text-sm">
        <thead className="border-b border-[var(--line)] text-xs uppercase tracking-wide text-[var(--muted)]">
          <tr>
            <th className="px-4 py-3">Affiliate</th>
            <th className="px-4 py-3">Pro?</th>
            <th className="px-4 py-3">Clicks</th>
            <th className="px-4 py-3">Signups</th>
            <th className="px-4 py-3">Live Pro</th>
            <th className="px-4 py-3">Per month</th>
            <th className="px-4 py-3">Owed</th>
            <th className="px-4 py-3">Paid</th>
            <th className="px-4 py-3">Lost</th>
            <th className="px-4 py-3">Payout</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--line)]">
          {rows.map((r) => (
            <tr key={r.id} className="align-top">
              <td className="px-4 py-3">
                <Link href={`/admin/owners/${r.id}`} className="font-semibold underline">
                  {r.businessName}
                </Link>
                <span className="block text-xs text-[var(--muted)]">{r.email}</span>
                {r.code ? <code className="text-xs">{r.code}</code> : null}
              </td>
              <td className="px-4 py-3">
                {r.eligible ? "Yes" : <span className="text-red-700">No</span>}
              </td>
              <td className="px-4 py-3">{r.clicks}</td>
              <td className="px-4 py-3">{r.signups}</td>
              <td className="px-4 py-3">{r.livePro}</td>
              <td className="px-4 py-3">{formatTotals(r.monthly)}</td>
              <td className="px-4 py-3 font-semibold">{formatTotals(r.owed)}</td>
              <td className="px-4 py-3">{formatTotals(r.paid)}</td>
              <td className="px-4 py-3 text-[var(--muted)]">{formatTotals(r.missed)}</td>
              <td className="px-4 py-3">
                {totalsAreEmpty(r.owed) ? (
                  <span className="text-[var(--muted)]">-</span>
                ) : (
                  <MarkAffiliatePaidForm affiliateOwnerId={r.id} owed={formatTotals(r.owed)} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
