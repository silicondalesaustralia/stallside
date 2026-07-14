import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { PaymentStatus } from "@/generated/prisma/client";
import DashboardStat from "@/components/DashboardStat";

export default async function AdminOverviewPage() {
  await requireAdmin();

  const [owners, stands, connectedStripe, paidOrders, recentOwners] =
    await Promise.all([
      prisma.owner.count(),
      prisma.stand.count(),
      prisma.owner.count({ where: { stripeChargesEnabled: true } }),
      prisma.order.findMany({
        where: {
          paymentStatus: {
            in: [PaymentStatus.PAID, PaymentStatus.CUSTOMER_CONFIRMED],
          },
        },
        select: { totalCents: true, currency: true, platformFeeCents: true },
      }),
      prisma.owner.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { user: true, _count: { select: { stands: true } } },
      }),
    ]);

  const byCurrency = new Map<string, number>();
  let platformFees = 0;
  for (const order of paidOrders) {
    byCurrency.set(
      order.currency,
      (byCurrency.get(order.currency) ?? 0) + order.totalCents,
    );
    platformFees += order.platformFeeCents;
  }

  return (
    <main className="flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Platform admin</h1>
        <p className="mt-1 text-[var(--muted)]">
          Desktop-only internal view of owners, stands, and sales.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStat label="Owners" value={String(owners)} />
        <DashboardStat label="Stands" value={String(stands)} />
        <DashboardStat label="Stripe connected" value={String(connectedStripe)} />
        <DashboardStat label="Paid orders" value={String(paidOrders.length)} />
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold">Sales volume</h2>
          {byCurrency.size === 0 ? (
            <p className="mt-2 text-sm text-[var(--muted)]">No paid sales yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {[...byCurrency.entries()].map(([currency, cents]) => (
                <li key={currency} className="flex justify-between gap-4">
                  <span>{currency}</span>
                  <span className="font-medium">{formatMoney(cents, currency)}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-sm text-[var(--muted)]">
            Tracked card platform fees logged: {platformFees} cents total across
            orders (see Orders for per-currency breakdown).
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Recent owners</h2>
          {recentOwners.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--muted)]">None yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {recentOwners.map((owner) => (
                <li key={owner.id} className="flex justify-between gap-4">
                  <span>
                    {owner.businessName}{" "}
                    <span className="text-[var(--muted)]">({owner.user.email})</span>
                  </span>
                  <span className="text-[var(--muted)]">
                    {owner._count.stands} stands
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/owners" className="mt-4 inline-block text-sm text-[var(--leaf-dark)] underline">
            View all owners
          </Link>
        </div>
      </section>
    </main>
  );
}
