import Link from "next/link";
import type { PaymentStatus } from "@/generated/prisma/client";
import DataTable, { cellClass, type DataColumn } from "@/components/dashboard/ui/DataTable";
import DataTableRow from "@/components/dashboard/ui/DataTableRow";
import StatusPill from "@/components/dashboard/ui/StatusPill";
import type { CollectionOrderView } from "@/lib/collections/group-collections";
import CollectionStatusButton from "./CollectionStatusButton";
import OrderCustomerEmail from "./OrderCustomerEmail";

const COLUMNS: DataColumn[] = [
  { label: "Order" },
  { label: "Customer" },
  { label: "Items", hideBelow: "sm" },
  { label: "Handover", hideBelow: "md" },
  { label: "Payment", hideBelow: "lg" },
  { label: "Status", align: "right" },
];

const muted = "text-[var(--muted)]";

function balanceHold(status: PaymentStatus): boolean {
  return status === "DEPOSIT_PAID" || status === "BALANCE_DUE" || status === "BALANCE_FAILED";
}

function handoverText(order: CollectionOrderView): string {
  if (order.handoverMode !== "DELIVER") return "Pick up";
  const address = [order.deliveryAddressLine1, order.deliverySuburb, order.deliveryPostcode].filter(Boolean).join(", ");
  return address ? `Deliver · ${address}` : "Deliver";
}

/** Packing list for one pre-order page or subscription cycle. */
export default function CollectionOrdersTable({ orders }: { orders: CollectionOrderView[] }) {
  return (
    <DataTable columns={COLUMNS}>
      {orders.map((order) => {
        const href = `/dashboard/orders/${order.id}`;
        const hold = balanceHold(order.paymentStatus);
        return (
          <DataTableRow key={order.id} href={href}>
            <td className={`${cellClass(COLUMNS[0])} whitespace-nowrap align-top font-semibold`}>
              <Link href={href} className="hover:underline">
                #{order.orderNumber}
              </Link>
            </td>
            <td className={`${cellClass(COLUMNS[1])} align-top`}>
              <p className="font-medium">{order.customerName ?? "Customer"}</p>
              {order.customerPhone ? <p className={`text-xs ${muted}`}>{order.customerPhone}</p> : null}
              {order.receiptEmail ? (
                <OrderCustomerEmail
                  orderId={order.id}
                  email={order.receiptEmail}
                  defaultSubject={`${order.stand.name} · order ${order.orderNumber}`}
                />
              ) : null}
            </td>
            <td className={`${cellClass(COLUMNS[2])} align-top`}>
              <ul>
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity}× {item.productNameSnapshot}
                    {item.optionsSnapshot ? <span className={muted}> ({item.optionsSnapshot})</span> : null}
                  </li>
                ))}
              </ul>
              {order.collectionNote ? <p className={`mt-1 text-xs ${muted}`}>{order.collectionNote}</p> : null}
            </td>
            <td className={`${cellClass(COLUMNS[3])} max-w-[220px] align-top ${muted}`}>{handoverText(order)}</td>
            <td className={`${cellClass(COLUMNS[4])} align-top`}>
              {hold ? (
                <StatusPill
                  label={order.paymentStatus === "BALANCE_FAILED" ? "Balance failed" : "Balance pending"}
                  tone="warning"
                />
              ) : (
                <StatusPill label="Paid" tone="success" />
              )}
            </td>
            <td className={`${cellClass(COLUMNS[5])} whitespace-nowrap align-top`}>
              {hold ? (
                <span className={`text-xs ${muted}`}>Hold until paid</span>
              ) : (
                <CollectionStatusButton orderId={order.id} status={order.collectionStatus ?? "ORDERED"} />
              )}
            </td>
          </DataTableRow>
        );
      })}
    </DataTable>
  );
}
