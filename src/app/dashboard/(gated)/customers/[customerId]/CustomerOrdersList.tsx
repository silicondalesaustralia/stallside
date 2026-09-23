import { formatMoney } from "@/lib/money";
import { orderPaymentLabel } from "@/lib/order-payment-label";

type OrderRow = {
  id: string;
  orderNumber: string;
  totalCents: number;
  currency: string;
  paymentStatus: string;
  paymentMethod: Parameters<typeof orderPaymentLabel>[0];
  localTransferMethodId: string | null;
  createdAt: Date;
  stand: { name: string };
};

export default function CustomerOrdersList({ orders }: { orders: OrderRow[] }) {
  if (orders.length === 0) {
    return (
      <p className="mt-2 text-sm text-[var(--muted)]">No linked orders.</p>
    );
  }
  return (
    <ul className="mt-3 divide-y divide-[var(--line)] border-y border-[var(--line)]">
      {orders.map((o) => (
        <li
          key={o.id}
          className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
        >
          <div>
            <p className="font-medium">#{o.orderNumber}</p>
            <p className="text-[var(--muted)]">
              {o.stand.name} · {o.createdAt.toLocaleDateString()} ·{" "}
              {orderPaymentLabel(o.paymentMethod, o.localTransferMethodId)}
            </p>
          </div>
          <span>
            {formatMoney(o.totalCents, o.currency)} ·{" "}
            {o.paymentStatus.toLowerCase().replaceAll("_", " ")}
          </span>
        </li>
      ))}
    </ul>
  );
}
