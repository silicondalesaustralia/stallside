import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function AdminOwnersPage() {
  await requireAdmin();
  const owners = await prisma.owner.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      _count: { select: { stands: true, orders: true, products: true } },
    },
  });

  return (
    <main className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Owners</h1>
        <p className="mt-1 text-[var(--muted)]">Farm stand businesses on the platform.</p>
      </div>
      {owners.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No owners yet.</p>
      ) : (
        <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {owners.map((owner) => (
            <li key={owner.id} className="py-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{owner.businessName}</p>
                <p className="text-[var(--muted)]">
                  {owner.subscriptionStatus.toLowerCase()} · fee{" "}
                  {owner.platformFeePercentBps / 100}%
                </p>
              </div>
              <p className="mt-1 text-[var(--muted)]">
                {owner.user.email} · {owner.contactEmail}
                {owner.contactPhone ? ` · ${owner.contactPhone}` : ""}
              </p>
              <p className="mt-1 text-[var(--muted)]">
                {owner._count.stands} stands · {owner._count.products} products ·{" "}
                {owner._count.orders} orders · Stripe:{" "}
                {owner.stripeChargesEnabled
                  ? "charges on"
                  : owner.stripeAccountId
                    ? "onboarding"
                    : "not connected"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
