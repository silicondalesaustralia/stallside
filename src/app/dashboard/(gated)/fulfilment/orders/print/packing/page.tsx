import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { OPS_STATUS_LABEL } from "@/lib/ops/status";
import { resolveOpsStatus } from "@/lib/ops/board";
import {
  fulfilmentContext,
  parseOpsView,
} from "../../ops-display";
import { loadOrdersForPrint, loadPrintBrand } from "../load-print-orders";
import PrintAuto from "../PrintAuto";

export default async function OpsPackingPrintPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string;
    ids?: string;
    q?: string;
    standId?: string;
  }>;
}) {
  const { owner } = await requireOwner();
  const sp = await searchParams;
  const view = parseOpsView(sp.view);
  const orders = await loadOrdersForPrint(owner.id, {
    ids: sp.ids,
    view: sp.view,
    q: sp.q,
    standId: sp.standId,
  });
  const brand = await loadPrintBrand(owner.id, sp.standId);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6 text-black">
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
          Packing sheet · {sp.ids ? "Selected orders" : view} ·{" "}
          {new Date().toLocaleDateString()}
        </p>
        <p className="text-sm text-black/70">
          {orders.length} order{orders.length === 1 ? "" : "s"}
        </p>
      </header>

      {orders.length === 0 ? (
        <p className="text-black/70">No orders to print.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order) => {
            const status = resolveOpsStatus(order);
            return (
              <section
                key={order.id}
                className="break-inside-avoid border-b border-black/20 pb-4"
              >
                <h2 className="text-base font-semibold">
                  {order.customerName ?? "Customer"} — Order #
                  {order.orderNumber}
                </h2>
                <p className="mt-1 text-sm text-black/70">
                  {fulfilmentContext(order)} · {OPS_STATUS_LABEL[status]}
                </p>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      {item.quantity} × {item.productNameSnapshot}
                      {item.optionsSnapshot
                        ? ` (${item.optionsSnapshot})`
                        : ""}
                      {item.packedAt ? " ✓" : ""}
                    </li>
                  ))}
                </ul>
                {order.collectionNote ? (
                  <p className="mt-2 text-sm">
                    Customer note: {order.collectionNote}
                  </p>
                ) : null}
                {order.fulfilment?.sellerNotes ? (
                  <p className="mt-1 text-sm">
                    Seller: {order.fulfilment.sellerNotes}
                  </p>
                ) : null}
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
