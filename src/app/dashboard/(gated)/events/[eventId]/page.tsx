import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { setSellerEventStatus } from "../actions";
import EventAddProductForm from "./EventAddProductForm";
import EventQuickSaleForm from "./EventQuickSaleForm";

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ sold?: string }>;
}) {
  const { owner } = await requireOwner();
  const { eventId } = await params;
  const { sold } = await searchParams;

  const event = await prisma.sellerEvent.findFirst({
    where: { id: eventId, ownerId: owner.id },
    include: {
      stand: { select: { id: true, name: true, currency: true } },
      products: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              priceCents: true,
              stockQuantity: true,
            },
          },
        },
      },
      orders: {
        select: { id: true, totalCents: true },
        orderBy: { createdAt: "desc" },
        take: 40,
      },
    },
  });
  if (!event) notFound();

  const catalogue = await prisma.product.findMany({
    where: {
      ownerId: owner.id,
      standId: event.standId,
      isArchived: false,
      isHidden: false,
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
    take: 100,
  });

  const currency = event.stand.currency;
  const salesTotal = event.orders.reduce((s, o) => s + o.totalCents, 0);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/events" className="underline">
            Markets &amp; events
          </Link>
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {event.name}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {event.status} · {event.stand.name}
          {event.locationLabel ? ` · ${event.locationLabel}` : ""} ·{" "}
          {event.startsAt.toLocaleString()}
        </p>
      </div>

      {sold ? (
        <p className="text-sm text-[var(--leaf-dark)]">Sale recorded.</p>
      ) : null}

      <form action={setSellerEventStatus} className="flex flex-wrap gap-2">
        <input type="hidden" name="id" value={event.id} />
        {(["DRAFT", "LIVE", "CLOSED"] as const).map((s) => (
          <button
            key={s}
            type="submit"
            name="status"
            value={s}
            className={`rounded-lg border px-3 py-2 text-sm ${
              event.status === s
                ? "border-[var(--leaf)] bg-[var(--leaf)]/10"
                : "border-[var(--line)]"
            }`}
          >
            {s}
          </button>
        ))}
      </form>

      <section className="dash-card p-4">
        <h2 className="font-semibold">Close-out</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {event.orders.length} sales · {formatMoney(salesTotal, currency)}
        </p>
        <ul className="mt-3 space-y-1 text-sm">
          {event.products.map((ep) => (
            <li key={ep.id}>
              {ep.product.name}: sold {ep.soldQty}
              {ep.allocatedQty != null ? ` / allocated ${ep.allocatedQty}` : ""}
            </li>
          ))}
        </ul>
      </section>

      <EventAddProductForm eventId={event.id} catalogue={catalogue} />

      {event.status === "LIVE" && event.products.length > 0 ? (
        <EventQuickSaleForm
          eventId={event.id}
          products={event.products}
          currency={currency}
        />
      ) : null}
    </main>
  );
}
