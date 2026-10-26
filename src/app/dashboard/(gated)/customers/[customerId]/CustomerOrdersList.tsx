import Link from "next/link";
import { formatMoney } from "@/lib/money";
import type { PaymentStatus } from "@/generated/prisma/client";
import { orderPaymentLabel, paymentStatusNote } from "@/lib/order-payment-label";

type OrderRow = {
  id: string;
  orderNumber: string;
  totalCents: number;
  currency: string;
  paymentStatus: PaymentStatus;
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
            <Link href={`/dashboard/orders/${o.id}`} className="font-medium hover:underline">
              #{o.orderNumber}
            </Link>
            <p className="text-[var(--muted)]">
              {o.stand.name} · {o.createdAt.toLocaleDateString()} ·{" "}
              {orderPaymentLabel(o.paymentMethod, o.localTransferMethodId)}
            </p>
          </div>
          <span>
            {formatMoney(o.totalCents, o.currency)} ·{" "}
            {paymentStatusNote(o.paymentStatus)}
          </span>
        </li>
      ))}
    </ul>
  );
}
