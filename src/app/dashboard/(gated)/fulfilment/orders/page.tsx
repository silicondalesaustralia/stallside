import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { loadOpsBoardOrders } from "@/lib/ops/board";
import {
  OPS_VIEWS,
  batchPackingProgress,
  emptyOpsMessage,
  parseOpsView,
  printHref,
  toOpsCardOrder,
  viewHref,
} from "./ops-display";
import OpsBoardClient from "./OpsBoardClient";

export default async function FulfilmentOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string;
    q?: string;
    standId?: string;
  }>;
}) {
  const { owner } = await requireOwner();
  const sp = await searchParams;
  const view = parseOpsView(sp.view);
  const q = sp.q?.trim() || null;
  const standId = sp.standId?.trim() || null;

  const [orders, stands] = await Promise.all([
    loadOpsBoardOrders({ ownerId: owner.id, view, q, standId }),
    prisma.stand.findMany({
      where: { ownerId: owner.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const cards = orders.map(toOpsCardOrder);
  const progress = batchPackingProgress(orders);

  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--muted)]">
            <Link href="/dashboard/fulfilment" className="underline">
              Fulfilment
            </Link>
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
            Orders board
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            Pack, mark ready, and hand over paid orders.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href={printHref("packing", view, q, standId)}
            className="font-semibold text-[var(--leaf-dark)] underline"
          >
            Print packing sheet
          </Link>
          <Link
            href={printHref("labels", view, q, standId)}
            className="font-semibold text-[var(--leaf-dark)] underline"
          >
            Print labels
          </Link>
          <Link
            href="/dashboard/fulfilment/orders/print/delivery"
            className="font-semibold text-[var(--leaf-dark)] underline"
          >
            Delivery run sheet
          </Link>
        </div>
      </div>

      <nav className="flex flex-wrap gap-2">
        {OPS_VIEWS.map((v) => (
          <Link
            key={v.id}
            href={viewHref(v.id, q, standId)}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
              view === v.id
                ? "bg-[var(--field)] text-[var(--ink-on-dark)]"
                : "border border-[var(--line)] bg-[var(--panel)] hover:border-[var(--leaf)]"
            }`}
          >
            {v.label}
          </Link>
        ))}
      </nav>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="view" value={view} />
        <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-sm">
          <span className="font-medium">Search</span>
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Name or order #"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        {stands.length > 1 ? (
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Business</span>
            <select
              name="standId"
              defaultValue={standId ?? ""}
              className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
            >
              <option value="">All</option>
              {stands.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <button
          type="submit"
          className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold hover:border-[var(--leaf)]"
        >
          Filter
        </button>
      </form>

      {orders.length > 0 ? (
        <p className="text-sm text-[var(--muted)]">
          {progress.packedOrders} / {progress.totalOrders} orders fully packed
        </p>
      ) : null}

      {orders.length === 0 ? (
        <p className="text-[var(--muted)]">
          {emptyOpsMessage(view, Boolean(q))}
        </p>
      ) : (
        <OpsBoardClient orders={cards} />
      )}
    </main>
  );
}
