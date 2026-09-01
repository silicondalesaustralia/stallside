import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { PaymentStatus } from "@/generated/prisma/client";

export default async function CustomersPage() {
  const { owner } = await requireOwner();
  const customers = await prisma.customer.findMany({
    where: { ownerId: owner.id },
    orderBy: { updatedAt: "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      marketingConsent: true,
      source: true,
      createdAt: true,
      _count: { select: { orders: true } },
      orders: {
        where: {
          paymentStatus: {
            in: [PaymentStatus.PAID, PaymentStatus.CUSTOMER_CONFIRMED],
          },
        },
        select: { totalCents: true, currency: true },
      },
    },
  });

  return (
    <main className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          Customers
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          Built from order and subscription emails. Cash sales without email stay
          anonymous.
        </p>
      </div>

      {customers.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          No customers yet. They appear after a paid order with a receipt email.
          Run{" "}
          <code className="rounded bg-[var(--wash)] px-1 text-xs">
            npx tsx scripts/backfill-customers.ts
          </code>{" "}
          once to import history.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {customers.map((c) => {
            const spend = c.orders.reduce((sum, o) => sum + o.totalCents, 0);
            const currency = c.orders[0]?.currency ?? "AUD";
            return (
              <li key={c.id} className="dash-card px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-[family-name:var(--font-display)] text-lg font-bold">
                      {c.name || c.email || "Customer"}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {c.email}
                      {c.phone ? ` · ${c.phone}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {c._count.orders} order
                      {c._count.orders === 1 ? "" : "s"}
                      {spend > 0
                        ? ` · ${formatMoney(spend, currency)} paid`
                        : ""}
                      {c.marketingConsent ? " · marketing ok" : ""}
                      {c.source ? ` · via ${c.source}` : ""}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/customers/${c.id}`}
                    className="rounded-full px-3 py-1.5 text-sm font-semibold outline outline-[var(--line)]"
                  >
                    View
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
