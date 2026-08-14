import Link from "next/link";
import { formatMoney } from "@/lib/money";

type StandRow = { id: string; name: string };
type RecentOrder = {
  id: string;
  orderNumber: string;
  totalCents: number;
  currency: string;
  paymentMethod: string;
  stand: { name: string };
};

export default function DashboardPanels({
  stands,
  products,
  stripeConnected,
  standRows,
  recent,
  ordersHref,
}: {
  stands: number;
  products: number;
  stripeConnected: boolean;
  standRows: StandRow[];
  recent: RecentOrder[];
  ordersHref: string;
}) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row">
      <div className="dash-card flex flex-[1.15] flex-col p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
          Snapshot
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {stands} stand{stands === 1 ? "" : "s"} · {products} active product
          {products === 1 ? "" : "s"}
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Stripe: {stripeConnected ? "Connected" : "Not connected"}
        </p>
        {standRows.map((stand) => (
          <Link
            key={stand.id}
            href={`/dashboard/businesses/${stand.id}/qr`}
            className="mt-4 inline-flex items-center justify-between rounded-full bg-[var(--field)] px-4 py-2.5 text-sm font-semibold text-[var(--ink-on-dark)]"
          >
            <span>{stand.name}</span>
            <span>QR &amp; print</span>
          </Link>
        ))}
      </div>
      <div className="dash-card flex-1 p-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
            Recent sales
          </p>
          <Link
            href={ordersHref}
            className="text-sm font-semibold text-[var(--leaf-dark)]"
          >
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">No sales yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {recent.map((order) => (
              <li key={order.id} className="flex justify-between gap-2">
                <span>
                  {order.orderNumber} · {order.stand.name}
                </span>
                <span className="font-receipt text-[var(--muted)]">
                  {formatMoney(order.totalCents, order.currency)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
