import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { PaymentStatus } from "@/generated/prisma/client";
import CustomersSearchForm from "./CustomersSearchForm";

const PAID: PaymentStatus[] = [
  PaymentStatus.PAID,
  PaymentStatus.CUSTOMER_CONFIRMED,
  PaymentStatus.DEPOSIT_PAID,
];

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { owner } = await requireOwner();
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const customers = await prisma.customer.findMany({
    where: {
      ownerId: owner.id,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
              { phone: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
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
        where: { paymentStatus: { in: PAID } },
        select: { totalCents: true, currency: true },
      },
    },
  });

  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
            Customers
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            Built from order and subscription emails. Cash without email stays
            anonymous.
          </p>
        </div>
        <Link
          href="/dashboard/communication/new"
          className="rounded-full bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white"
        >
          Send email
        </Link>
      </div>

      <CustomersSearchForm initialQuery={query} />

      {customers.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          {query
            ? "No customers match that search."
            : "No customers yet. They appear after a paid order with a receipt email."}
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
                        ? ` · ${formatMoney(spend, currency)} LTV`
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
