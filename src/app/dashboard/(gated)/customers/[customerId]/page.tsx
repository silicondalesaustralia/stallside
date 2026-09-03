import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { loadCustomerInsight } from "@/lib/grow/segments";
import { updateCustomerNotes } from "../actions";
import { addCustomerTag, removeCustomerTag } from "../tag-actions";

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
      tagLinks: { include: { tag: true } },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          orderNumber: true,
          totalCents: true,
          currency: true,
          paymentStatus: true,
          createdAt: true,
          stand: { select: { name: true } },
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
          {customer.marketingConsent ? "Marketing ok" : "No marketing"}
          {customer.source ? ` · via ${customer.source}` : ""}
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Orders" value={String(insight.orderCount)} />
        <Stat label="Spend" value={formatMoney(insight.spendCents, currency)} />
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

      <section className="dash-card flex max-w-lg flex-col gap-3 p-4">
        <h2 className="font-semibold">Tags</h2>
        <div className="flex flex-wrap gap-2">
          {customer.tagLinks.map((link) => (
            <form key={link.tagId} action={removeCustomerTag} className="inline">
              <input type="hidden" name="customerId" value={customer.id} />
              <input type="hidden" name="tagId" value={link.tagId} />
              <button
                type="submit"
                className="rounded-full border border-[var(--line)] px-3 py-1 text-xs"
              >
                {link.tag.name} ×
              </button>
            </form>
          ))}
          {customer.tagLinks.length === 0 ? (
            <span className="text-sm text-[var(--muted)]">No tags yet</span>
          ) : null}
        </div>
        <form action={addCustomerTag} className="flex flex-wrap gap-2">
          <input type="hidden" name="customerId" value={customer.id} />
          <input
            name="tag"
            placeholder="Add tag"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
          />
          <button type="submit" className="text-sm font-semibold underline">
            Add
          </button>
        </form>
      </section>

      {saved ? (
        <p className="text-sm text-[var(--leaf-dark)]">Notes saved.</p>
      ) : null}

      <form
        action={updateCustomerNotes.bind(null, customer.id)}
        className="dash-card flex max-w-lg flex-col gap-3 p-4"
      >
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Notes (private)</span>
          <textarea
            name="notes"
            rows={3}
            defaultValue={customer.notes ?? ""}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          />
        </label>
        <button type="submit" className={dashCtaClass}>
          Save notes
        </button>
      </form>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">
            Orders
          </h2>
          {customer.orders.length > 0 ? (
            <Link
              href={`/dashboard/orders?customerId=${customer.id}`}
              className="text-sm underline"
            >
              Filter in Orders
            </Link>
          ) : null}
        </div>
        {customer.orders.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted)]">No orders linked yet.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {customer.orders.map((o) => (
              <li key={o.id} className="dash-card px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">{o.orderNumber}</span>
                  <span>{formatMoney(o.totalCents, o.currency)}</span>
                </div>
                <p className="mt-1 text-[var(--muted)]">
                  {o.stand.name} ·{" "}
                  {o.paymentStatus.replace(/_/g, " ").toLowerCase()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="dash-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
