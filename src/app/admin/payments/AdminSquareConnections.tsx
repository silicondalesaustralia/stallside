import Link from "next/link";
import {
  formatAdminDate as formatDate,
  type SquareConnectionRow,
} from "@/lib/admin-payment-connections";
import AdminConnectionFlag from "./AdminConnectionFlag";

export default function AdminSquareConnections({ rows }: { rows: SquareConnectionRow[] }) {
  const active = rows.filter((r) => r.status === "ACTIVE").length;
  return (
    <section className="dash-card p-5">
      <h2 className="text-lg font-semibold">Square</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {active} active of {rows.length} connection{rows.length === 1 ? "" : "s"}.
      </p>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--muted)]">No sellers have connected Square yet.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-[var(--muted)]">
              <tr className="border-b border-[var(--line)]">
                <th className="py-2 pr-3 font-medium">Seller</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 pr-3 font-medium">Set up</th>
                <th className="py-2 pr-3 font-medium">Linked</th>
                <th className="py-2 pr-3 font-medium">Last sync</th>
                <th className="py-2 font-medium">Connected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {rows.map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="py-3 pr-3">
                    <Link href={`/admin/owners/${r.owner.id}`} className="font-medium underline">
                      {r.owner.businessName}
                    </Link>
                    <p className="text-[var(--muted)]">
                      {r.owner.user?.email ?? r.owner.contactEmail}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      Square: {r.merchantName ?? r.providerMerchantId}
                    </p>
                  </td>
                  <td className="py-3 pr-3">
                    <p>{r.status.toLowerCase()}</p>
                    {r.owner.onlinePaymentProvider === "SQUARE" ? (
                      <p className="text-xs text-[var(--muted)]">Checkout provider</p>
                    ) : null}
                    {r.lastError ? (
                      <p className="mt-1 max-w-[220px] text-xs text-red-700">{r.lastError}</p>
                    ) : null}
                  </td>
                  <td className="py-3 pr-3">
                    <div className="flex flex-col gap-0.5">
                      <AdminConnectionFlag on={Boolean(r.primaryLocationId)} label="Location" />
                      <AdminConnectionFlag on={r.paymentsEnabled} label="Payments" />
                      <AdminConnectionFlag on={r.catalogSyncEnabled} label="Products" />
                      <AdminConnectionFlag on={r.inventorySyncEnabled} label="Stock" />
                    </div>
                  </td>
                  <td className="py-3 pr-3">{r._count.variantMappings}</td>
                  <td className="py-3 pr-3">{formatDate(r.lastSyncAt)}</td>
                  <td className="py-3">
                    {formatDate(r.createdAt)}
                    {r.disconnectedAt ? (
                      <p className="text-xs text-[var(--muted)]">
                        Disconnected {formatDate(r.disconnectedAt)}
                      </p>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
