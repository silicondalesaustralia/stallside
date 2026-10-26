import Link from "next/link";
import DetailCard from "@/components/dashboard/ui/DetailCard";
import type { OrderDetail } from "@/lib/orders/load-order-detail";
import OrderCustomerEmail from "../../collections/OrderCustomerEmail";

export default function OrderCustomerCard({ order }: { order: OrderDetail }) {
  const name = order.customerName || order.receiptEmail || "No customer details";
  return (
    <DetailCard title="Customer">
      <div className="space-y-1 text-sm">
        {order.customerId ? (
          <Link
            href={`/dashboard/customers/${order.customerId}`}
            className="font-semibold text-[var(--leaf-dark)] hover:underline"
          >
            {name}
          </Link>
        ) : (
          <p className="font-semibold">{name}</p>
        )}
        {order.receiptEmail ? (
          <div className="break-all">
            <OrderCustomerEmail
              orderId={order.id}
              email={order.receiptEmail}
              defaultSubject={`${order.stand.name} · order ${order.orderNumber}`}
            />
          </div>
        ) : null}
        {order.customerPhone ? (
          <p>
            <a href={`tel:${order.customerPhone}`} className="hover:underline">
              {order.customerPhone}
            </a>
          </p>
        ) : null}
      </div>
    </DetailCard>
  );
}
