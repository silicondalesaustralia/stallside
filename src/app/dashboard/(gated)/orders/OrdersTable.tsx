import Link from "next/link";
import DataTable, { cellClass, type DataColumn } from "@/components/dashboard/ui/DataTable";
import DataTableRow from "@/components/dashboard/ui/DataTableRow";
import StatusPill from "@/components/dashboard/ui/StatusPill";
import { formatMoney } from "@/lib/money";
import { formatDateInTz } from "@/lib/stand-timezone";
import {
  orderChannelLabel,
  orderDeliveryLabel,
  orderFulfilmentPill,
  orderItemCount,
  orderPaymentPill,
  type OrderFulfilmentInput,
} from "@/lib/orders/order-status";
import type { SaleOrigin } from "@/generated/prisma/client";

export type OrdersTableRow = OrderFulfilmentInput & {
  id: string;
  orderNumber: string;
  createdAt: Date;
  customerName: string | null;
  receiptEmail: string | null;
  totalCents: number;
  currency: string;
  refundedCents: number | null;
  shopperSubscriptionId: string | null;
  saleOrigin: SaleOrigin;
  trackingNumber: string | null;
  items: { quantity: number }[];
};

const COLUMNS: DataColumn[] = [
  { label: "Order" },
  { label: "Date", hideBelow: "sm" },
  { label: "Customer", hideBelow: "md" },
  { label: "Channel", hideBelow: "lg" },
  { label: "Total", align: "right" },
  { label: "Payment status" },
  { label: "Fulfilment status", hideBelow: "md" },
  { label: "Items", hideBelow: "lg" },
  { label: "Delivery method", hideBelow: "lg" },
];

const muted = "text-[var(--muted)]";

export default function OrdersTable({
  orders,
  timeZone,
  footer,
}: {
  orders: OrdersTableRow[];
  timeZone: string;
  footer?: React.ReactNode;
}) {
  return (
    <DataTable columns={COLUMNS} footer={footer}>
      {orders.map((order) => {
        const href = `/dashboard/orders/${order.id}`;
        const fulfilment = orderFulfilmentPill(order);
        const items = orderItemCount(order.items);
        return (
          <DataTableRow key={order.id} href={href}>
            <td className={`${cellClass(COLUMNS[0])} whitespace-nowrap font-semibold`}>
              <Link href={href} className="hover:underline">
                #{order.orderNumber}
              </Link>
            </td>
            <td className={`${cellClass(COLUMNS[1])} whitespace-nowrap ${muted}`}>
              {formatDateInTz(order.createdAt, timeZone, {
                day: "numeric",
                month: "short",
                hour: "numeric",
                minute: "2-digit",
              })}
            </td>
            <td className={`${cellClass(COLUMNS[2])} max-w-[180px] truncate`}>
              {order.customerName || order.receiptEmail || <span className={muted}>No customer</span>}
            </td>
            <td className={`${cellClass(COLUMNS[3])} whitespace-nowrap ${muted}`}>
              {orderChannelLabel(order)}
            </td>
            <td className={`${cellClass(COLUMNS[4])} font-receipt whitespace-nowrap`}>
              {formatMoney(order.totalCents, order.currency)}
            </td>
            <td className={cellClass(COLUMNS[5])}>
              <StatusPill {...orderPaymentPill(order)} />
            </td>
            <td className={cellClass(COLUMNS[6])}>
              {fulfilment ? <StatusPill {...fulfilment} /> : <span className={muted}>—</span>}
            </td>
            <td className={`${cellClass(COLUMNS[7])} whitespace-nowrap ${muted}`}>
              {items} item{items === 1 ? "" : "s"}
            </td>
            <td className={`${cellClass(COLUMNS[8])} whitespace-nowrap ${muted}`}>
              {orderDeliveryLabel(order)}
            </td>
          </DataTableRow>
        );
      })}
    </DataTable>
  );
}
