import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import DashPrimaryCta from "@/components/DashPrimaryCta";
import { formatMoney } from "@/lib/money";

export default async function CampaignsPage() {
  const { owner } = await requireOwner();
  const currency = owner.billingCurrency || "AUD";

  const campaigns = await prisma.campaign.findMany({
    where: { ownerId: owner.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--muted)]">
            <Link href="/dashboard/marketing" className="underline">
              Grow
            </Link>
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Campaigns
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            Email customers about menus, offers, and comebacks.
          </p>
        </div>
        <DashPrimaryCta href="/dashboard/campaigns/new">
          + New campaign
        </DashPrimaryCta>
      </div>

      {campaigns.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          No campaigns yet.{" "}
          <Link href="/dashboard/campaigns/new" className="underline">
            Tell your customers
          </Link>{" "}
          when the next drop is ready.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {campaigns.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm"
            >
              <div>
                <Link
                  href={`/dashboard/campaigns/${c.id}`}
                  className="font-medium underline"
                >
                  {c.name}
                </Link>
                <p className="mt-1 text-[var(--muted)]">
                  {c.status} · {c.sentCount} sent · {c.attributedOrders} orders ·{" "}
                  {formatMoney(c.attributedRevenueCents, currency)}
                </p>
              </div>
              <Link
                href={`/dashboard/campaigns/${c.id}`}
                className="text-[var(--leaf-dark)] underline"
              >
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
