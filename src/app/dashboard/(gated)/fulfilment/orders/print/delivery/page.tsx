import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { OPS_STATUS_LABEL } from "@/lib/ops/status";
import { resolveOpsStatus } from "@/lib/ops/board";
import {
  deliveryAddressLine,
  fulfilmentContext,
} from "../../ops-display";
import { loadOrdersForPrint, loadPrintBrand } from "../load-print-orders";
import PrintAuto from "../PrintAuto";

export default async function OpsDeliveryRunSheetPage({
  searchParams,
}: {
  searchParams: Promise<{ standId?: string }>;
}) {
  const { owner } = await requireOwner();
  const sp = await searchParams;
  const orders = await loadOrdersForPrint(owner.id, {
    view: "today",
    standId: sp.standId,
    handover: "deliver",
  });
  const brand = await loadPrintBrand(owner.id, sp.standId);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6 text-black">
      <div className="print:hidden flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard/fulfilment/orders"
          className="text-sm underline text-[var(--muted)]"
        >
          Back to board
        </Link>
        <PrintAuto />
      </div>

      <header className="border-b border-black pb-3">
        <p className="text-lg font-semibold">{brand.name}</p>
        <p className="text-sm text-black/70">
          Delivery run sheet · Today · {new Date().toLocaleDateString()}
        </p>
        <p className="text-sm text-black/70">
          {orders.length} delivery{orders.length === 1 ? "" : "s"}
        </p>
      </header>

      {orders.length === 0 ? (
        <p className="text-black/70">No deliveries due today.</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-black text-left">
              <th className="py-2 pr-2 font-semibold">#</th>
              <th className="py-2 pr-2 font-semibold">Customer</th>
              <th className="py-2 pr-2 font-semibold">Address</th>
              <th className="py-2 pr-2 font-semibold">Items</th>
              <th className="py-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => {
              const status = resolveOpsStatus(order);
              const address =
                deliveryAddressLine(order) || fulfilmentContext(order);
              return (
                <tr
                  key={order.id}
                  className="break-inside-avoid border-b border-black/20 align-top"
                >
                  <td className="py-2 pr-2">{index + 1}</td>
                  <td className="py-2 pr-2">
                    <p className="font-medium">
                      {order.customerName ?? "Customer"}
                    </p>
                    <p className="text-black/60">#{order.orderNumber}</p>
                    {order.deliveryNotes ? (
                      <p className="mt-1 text-black/70">
                        {order.deliveryNotes}
                      </p>
                    ) : null}
                  </td>
                  <td className="py-2 pr-2">{address}</td>
                  <td className="py-2 pr-2">
                    {order.items
                      .map(
                        (i) =>
                          `${i.quantity}× ${i.productNameSnapshot}`,
                      )
                      .join(", ")}
                  </td>
                  <td className="py-2">{OPS_STATUS_LABEL[status]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}
