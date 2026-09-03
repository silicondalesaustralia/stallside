import Link from "next/link";
import { notFound } from "next/navigation";
import { FulfilmentStatus } from "@/generated/prisma/client";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { OPS_STATUS_LABEL } from "@/lib/ops/status";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { markLookupOrderCollected } from "../actions";

export default async function OpsLookupPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ done?: string }>;
}) {
  const { owner } = await requireOwner();
  const { token } = await params;
  const { done } = await searchParams;

  const order = await prisma.order.findFirst({
    where: { opsLookupToken: token, ownerId: owner.id },
    include: {
      stand: { select: { name: true } },
      items: {
        select: {
          id: true,
          productNameSnapshot: true,
          quantity: true,
          optionsSnapshot: true,
          packedAt: true,
        },
      },
      fulfilment: { select: { fulfilmentStatus: true, sellerNotes: true } },
    },
  });
  if (!order) notFound();

  const status =
    order.fulfilment?.fulfilmentStatus ??
    (order.collectionStatus === "READY"
      ? FulfilmentStatus.READY
      : order.collectionStatus === "COLLECTED"
        ? FulfilmentStatus.COLLECTED
        : FulfilmentStatus.NEW);

  const packed = order.items.filter((i) => i.packedAt).length;
  const canCollect = status === FulfilmentStatus.READY;

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/operate" className="underline">
            Operate
          </Link>
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {order.orderNumber}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {OPS_STATUS_LABEL[status]} · {order.stand.name}
          {order.customerName ? ` · ${order.customerName}` : ""}
        </p>
      </div>

      {done ? (
        <p className="text-sm text-[var(--leaf-dark)]">Marked collected.</p>
      ) : null}

      <section className="dash-card p-4">
        <h2 className="font-semibold">Packing</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Packed {packed}/{order.items.length}
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-2">
              <span>
                {item.quantity}× {item.productNameSnapshot}
                {item.optionsSnapshot ? ` (${item.optionsSnapshot})` : ""}
              </span>
              <span className="text-[var(--muted)]">
                {item.packedAt ? "Packed" : "—"}
              </span>
            </li>
          ))}
        </ul>
        {order.fulfilment?.sellerNotes ? (
          <p className="mt-3 text-sm">Notes: {order.fulfilment.sellerNotes}</p>
        ) : null}
      </section>

      {canCollect ? (
        <form action={markLookupOrderCollected}>
          <input type="hidden" name="orderId" value={order.id} />
          <input type="hidden" name="token" value={token} />
          <button type="submit" className={`${dashCtaClass} w-full`}>
            Mark collected
          </button>
        </form>
      ) : null}
    </main>
  );
}
