import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import {
  ensureOpsLookupToken,
  loadOpsOrderById,
  resolveOpsStatus,
} from "@/lib/ops/board";
import { OPS_STATUS_LABEL } from "@/lib/ops/status";
import { appBaseUrl } from "@/lib/app-url";
import { fulfilmentContext, toOpsCardOrder } from "../ops-display";
import OpsOrderDetailActions from "./OpsOrderDetailActions";
import OpsSellerNotesForm from "./OpsSellerNotesForm";
import OpsItemPackList from "./OpsItemPackList";
import OpsNotifyReadyButton from "./OpsNotifyReadyButton";

export default async function OpsOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { owner } = await requireOwner();
  const { orderId } = await params;

  const order = await loadOpsOrderById(owner.id, orderId);
  if (!order) notFound();

  const token = await ensureOpsLookupToken(order.id, owner.id);
  const card = toOpsCardOrder(order);
  const status = resolveOpsStatus(order);
  const lookupUrl = `${appBaseUrl()}/dashboard/ops/lookup/${token}`;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/orders" className="underline">
            ← Orders
          </Link>
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {card.customerName ?? "Customer"}
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          Order #{card.orderNumber} · {OPS_STATUS_LABEL[status]} ·{" "}
          {card.paymentLabel}
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {fulfilmentContext(order)}
        </p>
      </div>

      <section className="dash-card flex flex-col gap-3 p-5">
        <h2 className="font-semibold">Pack items</h2>
        <OpsItemPackList items={card.items} />
        <p className="text-sm text-[var(--muted)]">
          {card.packed} / {card.total} packed
        </p>
      </section>

      <OpsSellerNotesForm orderId={order.id} notes={card.notes ?? ""} />

      <OpsOrderDetailActions
        orderId={order.id}
        status={status}
        handover={card.handover}
      />

      <OpsNotifyReadyButton
        orderId={order.id}
        standName={order.stand.name}
        orderNumber={order.orderNumber}
        hasEmail={Boolean(order.receiptEmail)}
      />

      <section className="dash-card flex flex-col gap-2 p-5">
        <h2 className="font-semibold">Print & lookup</h2>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href={`/dashboard/fulfilment/orders/print/packing?ids=${order.id}`}
            className="font-semibold text-[var(--leaf-dark)] underline"
          >
            Packing sheet
          </Link>
          <Link
            href={`/dashboard/fulfilment/orders/print/labels?ids=${order.id}`}
            className="font-semibold text-[var(--leaf-dark)] underline"
          >
            Labels
          </Link>
        </div>
        <p className="mt-2 text-sm text-[var(--muted)]">QR lookup URL</p>
        <code className="break-all rounded-lg bg-[var(--wash)] px-3 py-2 text-xs">
          {lookupUrl}
        </code>
      </section>
    </main>
  );
}
