import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { GROW_ORDER_STATUSES } from "@/lib/grow/segments";
import { formatMoney } from "@/lib/money";
import DashPrimaryCta from "@/components/DashPrimaryCta";

export default async function MarketingHubPage() {
  const { owner } = await requireOwner();
  const currency = owner.billingCurrency || "AUD";

  const [
    customerCount,
    consentCount,
    pendingReviews,
    restockWaiting,
    recentCampaigns,
    loyalty,
    activeCoupons,
  ] = await Promise.all([
    prisma.customer.count({ where: { ownerId: owner.id } }),
    prisma.customer.count({
      where: { ownerId: owner.id, marketingConsent: true },
    }),
    prisma.review.count({
      where: { ownerId: owner.id, status: "PENDING", rating: { gte: 1 } },
    }),
    prisma.restockSubscriber.count({
      where: { stand: { ownerId: owner.id }, status: "ACTIVE" },
    }),
    prisma.campaign.findMany({
      where: { ownerId: owner.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        status: true,
        attributedOrders: true,
        attributedRevenueCents: true,
        sentCount: true,
      },
    }),
    prisma.loyaltyProgram.findUnique({ where: { ownerId: owner.id } }),
    prisma.promotion.count({
      where: { ownerId: owner.id, isActive: true },
    }),
  ]);

  const links = [
    { href: "/dashboard/campaigns", label: "Campaigns" },
    { href: "/dashboard/coupons", label: "Discounts" },
    { href: "/dashboard/loyalty", label: "Loyalty" },
    { href: "/dashboard/reviews", label: "Reviews" },
    { href: "/dashboard/gift-cards", label: "Gift cards" },
    { href: "/dashboard/customers/segments", label: "Segments" },
  ];

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Marketing</h1>
          <p className="mt-1 text-[var(--muted)]">
            Campaigns, discounts, and customer retention.
          </p>
        </div>
        <DashPrimaryCta href="/dashboard/campaigns/new">
          Create campaign
        </DashPrimaryCta>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Customers" value={String(customerCount)} />
        <Metric label="Marketing opt-ins" value={String(consentCount)} />
        <Metric label="Reviews to approve" value={String(pendingReviews)} />
        <Metric label="Restock waiting" value={String(restockWaiting)} />
        <Metric label="Active discounts" value={String(activeCoupons)} />
        <Metric label="Loyalty" value={loyalty?.isActive ? "On" : "Off"} />
      </div>

      <nav className="flex flex-wrap gap-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-lg border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold hover:border-[var(--leaf)]"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <section>
        <h2 className="text-lg font-semibold">Recent campaigns</h2>
        {recentCampaigns.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted)]">
            No campaigns yet.{" "}
            <Link href="/dashboard/campaigns/new" className="underline">
              Tell your customers
            </Link>{" "}
            when the next menu or drop is ready.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {recentCampaigns.map((c) => (
              <li key={c.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                <Link href={`/dashboard/campaigns/${c.id}`} className="font-medium underline">
                  {c.name}
                </Link>
                <span className="text-[var(--muted)]">
                  {c.status} · {c.sentCount} sent · {c.attributedOrders} orders ·{" "}
                  {formatMoney(c.attributedRevenueCents, currency)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="dash-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
