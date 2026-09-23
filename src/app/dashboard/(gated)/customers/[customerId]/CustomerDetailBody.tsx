import Link from "next/link";
import { formatMoney } from "@/lib/money";
import CustomerStat from "./CustomerStat";
import CustomerOrdersList from "./CustomerOrdersList";
import { updateCustomerNotes } from "../actions";

type OrderRow = Parameters<typeof CustomerOrdersList>[0]["orders"][number];

type SubRow = {
  id: string;
  status: string;
  billingPlan: string | null;
  offer: { title: string };
};

export default function CustomerDetailBody({
  customer,
  orders,
  subscriptions,
  insight,
  currency,
  saved,
}: {
  customer: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    notes: string | null;
    marketingConsent: boolean;
    source: string | null;
  };
  orders: OrderRow[];
  subscriptions: SubRow[];
  insight: {
    orderCount: number;
    spendCents: number;
    aovCents: number;
    lastOrderAt: Date | null;
    productNames: string[];
  };
  currency: string;
  saved: boolean;
}) {
  return (
    <>
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
        <CustomerStat label="Orders" value={String(insight.orderCount)} />
        <CustomerStat
          label="LTV"
          value={formatMoney(insight.spendCents, currency)}
        />
        <CustomerStat
          label="AOV"
          value={formatMoney(insight.aovCents, currency)}
        />
        <CustomerStat
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

      {saved ? <p className="text-sm text-[var(--ok)]">Notes saved.</p> : null}

      <section className="dash-card max-w-lg p-4">
        <h2 className="font-semibold">Notes</h2>
        <form
          action={updateCustomerNotes.bind(null, customer.id)}
          className="mt-3"
        >
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
        <CustomerOrdersList orders={orders} />
      </section>

      {subscriptions.length > 0 ? (
        <section>
          <h2 className="font-semibold">Subscriptions</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {subscriptions.map((s) => (
              <li key={s.id} className="text-[var(--muted)]">
                {s.offer.title} · {s.status}
                {s.billingPlan ? ` · ${s.billingPlan.toLowerCase()}` : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
