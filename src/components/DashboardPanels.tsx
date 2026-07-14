import Link from "next/link";
import { formatMoney } from "@/lib/money";

type StandRow = { id: string; name: string };
type LowStockRow = {
  id: string;
  name: string;
  stockQuantity: number;
  stand: { name: string };
};
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
  lowStock,
  recent,
  ordersHref,
}: {
  stands: number;
  products: number;
  stripeConnected: boolean;
  standRows: StandRow[];
  lowStock: LowStockRow[];
  recent: RecentOrder[];
  ordersHref: string;
}) {
  return (
    <>
      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold">Snapshot</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {stands} stand{stands === 1 ? "" : "s"} · {products} active product
            {products === 1 ? "" : "s"}
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Stripe:{" "}
            {stripeConnected
              ? "Connected"
              : "Not connected - card checkout disabled"}
          </p>
          {standRows.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {standRows.map((stand) => (
                <li key={stand.id}>
                  <Link
                    href={`/dashboard/stands/${stand.id}/qr`}
                    className="flex items-center justify-between gap-3 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-4 py-4 text-sm font-semibold transition hover:border-[var(--leaf)]"
                  >
                    <span>{stand.name}</span>
                    <span className="text-[var(--leaf-dark)]">QR &amp; print →</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div>
          <h2 className="text-lg font-semibold">Low stock</h2>
          {lowStock.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--muted)]">Nothing low right now.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {lowStock.map((p) => (
                <li key={p.id} className="flex justify-between gap-4">
                  <span>
                    {p.name}{" "}
                    <span className="text-[var(--muted)]">({p.stand.name})</span>
                  </span>
                  <span className="font-receipt font-medium text-[var(--warn)]">
                    {p.stockQuantity} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent sales</h2>
          <Link href={ordersHref} className="text-sm text-[var(--leaf-dark)] underline">
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">No sales yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {recent.map((order) => (
              <li
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
              >
                <span>
                  {order.orderNumber} · {order.stand.name}
                </span>
                <span className="font-receipt text-[var(--muted)]">
                  {order.paymentMethod.toLowerCase()} ·{" "}
                  {formatMoney(order.totalCents, order.currency)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
