import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { orderPaymentLabel } from "@/lib/order-payment-label";
import { loadCustomerInsight } from "@/lib/customers/insight";
import { updateCustomerNotes } from "../actions";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="dash-card px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

export default async function CustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ customerId: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { customerId } = await params;
  const { saved } = await searchParams;
  const { owner } = await requireOwner();

  const customer = await prisma.customer.findFirst({
    where: { id: customerId, ownerId: owner.id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          orderNumber: true,
          totalCents: true,
          currency: true,
          paymentStatus: true,
          paymentMethod: true,
          localTransferMethodId: true,
          createdAt: true,
          stand: { select: { name: true } },
        },
      },
      shopperSubscriptions: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          status: true,
          billingPlan: true,
          offer: { select: { title: true } },
        },
      },
    },
  });
  if (!customer) notFound();

  const insight = await loadCustomerInsight(owner.id, customer.id);
  const currency =
    customer.orders[0]?.currency ?? owner.billingCurrency ?? "AUD";

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--muted)]">
            <Link href="/dashboard/customers" className="underline">
              Customers
            </Link>
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
            {customer.name || customer.email || "Customer"}
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            {customer.email}
            {customer.phone ? ` · ${customer.phone}` : ""}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {customer.marketingConsent ? "Marketing ok" : "No marketing opt-in"}
            {customer.source ? ` · via ${customer.source}` : ""}
          </p>
        </div>
        {customer.email ? (
          <Link
            href={`/dashboard/communication/new?customerId=${customer.id}`}
            className="rounded-full bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white"
          >
            Email this customer
          </Link>
        ) : null}
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Orders" value={String(insight.orderCount)} />
        <Stat label="LTV" value={formatMoney(insight.spendCents, currency)} />
        <Stat label="AOV" value={formatMoney(insight.aovCents, currency)} />
        <Stat
          label="Last order"
          value={
            insight.lastOrderAt
              ? insight.lastOrderAt.toLocaleDateString()
              : "—"
          }
        />
      </section>

      {insight.productNames.length > 0 ? (
        <p className="text-sm text-[var(--muted)]">
          Bought: {insight.productNames.join(", ")}
        </p>
      ) : null}

      {saved ? (
        <p className="text-sm text-[var(--ok)]">Notes saved.</p>
      ) : null}

      <section className="dash-card max-w-lg p-4">
        <h2 className="font-semibold">Notes</h2>
        <form action={updateCustomerNotes.bind(null, customer.id)} className="mt-3">
          <textarea
            name="notes"
            defaultValue={customer.notes ?? ""}
            rows={4}
            maxLength={4000}
            className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm"
          />
          <button
            type="submit"
            className="mt-2 text-sm font-semibold text-[var(--leaf-dark)] underline"
          >
            Save notes
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-semibold">Orders</h2>
        {customer.orders.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted)]">No linked orders.</p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {customer.orders.map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">#{o.orderNumber}</p>
                  <p className="text-[var(--muted)]">
                    {o.stand.name} · {o.createdAt.toLocaleDateString()} ·{" "}
                    {orderPaymentLabel(o.paymentMethod, o.localTransferMethodId)}
                  </p>
                </div>
                <span>
                  {formatMoney(o.totalCents, o.currency)} ·{" "}
                  {o.paymentStatus.toLowerCase().replaceAll("_", " ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {customer.shopperSubscriptions.length > 0 ? (
        <section>
          <h2 className="font-semibold">Subscriptions</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {customer.shopperSubscriptions.map((s) => (
              <li key={s.id} className="text-[var(--muted)]">
                {s.offer.title} · {s.status}
                {s.billingPlan ? ` · ${s.billingPlan.toLowerCase()}` : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
