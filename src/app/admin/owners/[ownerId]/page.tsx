import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { DEFAULT_CURRENCY } from "@/lib/constants";
import {
  applyCouponToOwner,
  cancelOwnerSubscription,
  refundLatestSubscriptionInvoice,
} from "./actions";

export default async function AdminOwnerDetailPage({
  params,
}: {
  params: Promise<{ ownerId: string }>;
}) {
  await requireAdmin();
  const { ownerId } = await params;
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
    include: {
      user: true,
      stands: { select: { id: true, name: true, slug: true } },
    },
  });
  if (!owner) notFound();

  const refundAction = refundLatestSubscriptionInvoice.bind(null, owner.id);
  const cancelAction = cancelOwnerSubscription.bind(null, owner.id);

  return (
    <main className="flex max-w-2xl flex-col gap-8">
      <p className="text-sm text-[var(--muted)]">
        <Link href="/admin/owners" className="underline">
          Subscribers
        </Link>
      </p>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {owner.businessName}
        </h1>
        <p className="mt-1 text-[var(--muted)]">{owner.user.email}</p>
      </div>

      <section className="space-y-2 text-sm rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
        <p>
          Owner ID: <code className="text-xs">{owner.id}</code>
        </p>
        <p>Plan: {owner.subscriptionPlan ?? "—"}</p>
        <p>Status: {owner.subscriptionStatus.toLowerCase()}</p>
        <p>
          LTV: {formatMoney(owner.lifetimePaidCents, DEFAULT_CURRENCY)} · Fee{" "}
          {formatMoney(owner.monthlyFeeCents, DEFAULT_CURRENCY)}/mo
        </p>
        <p>
          Stripe customer:{" "}
          {owner.stripeCustomerId ? (
            <code className="text-xs">{owner.stripeCustomerId}</code>
          ) : (
            "—"
          )}
        </p>
        <p>
          Subscription:{" "}
          {owner.stripeSubscriptionId ? (
            <code className="text-xs">{owner.stripeSubscriptionId}</code>
          ) : (
            "—"
          )}
        </p>
        <p>
          Stalls:{" "}
          {owner.stands.length === 0
            ? "None"
            : owner.stands.map((s) => `${s.name} (/${s.slug})`).join(", ")}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Apply signup coupon</h2>
        <p className="text-sm text-[var(--muted)]">
          Applies an active Stripe promotion code to their current subscription.
        </p>
        <form action={applyCouponToOwner} className="flex flex-wrap gap-2">
          <input type="hidden" name="ownerId" value={owner.id} />
          <input
            name="code"
            placeholder="PILOT2026"
            required
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm uppercase"
          />
          <button
            type="submit"
            className="rounded-lg bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white"
          >
            Apply code
          </button>
        </form>
      </section>

      <section className="flex flex-wrap gap-3">
        <form action={refundAction}>
          <button
            type="submit"
            className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-800"
          >
            Refund latest invoice
          </button>
        </form>
        <form action={cancelAction}>
          <button
            type="submit"
            className="rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold"
          >
            Cancel at period end
          </button>
        </form>
      </section>
    </main>
  );
}
