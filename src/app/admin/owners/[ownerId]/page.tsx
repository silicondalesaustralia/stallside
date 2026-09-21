import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { audRatesFromMarket, formatBillingWithAud } from "@/lib/fx-to-aud";
import {
  formatFeeBuckets,
  formatOwnerLtv,
  platformFeesByOwner,
} from "@/lib/owner-ltv";
import AdminDeleteOwnerButton from "./AdminDeleteOwnerButton";
import AdminOwnerTools from "./AdminOwnerTools";
import OwnerPaymentLedger from "./OwnerPaymentLedger";

export default async function AdminOwnerDetailPage({
  params,
}: {
  params: Promise<{ ownerId: string }>;
}) {
  await requireAdmin();
  const { ownerId } = await params;
  const [owner, fx, feesByOwner] = await Promise.all([
    prisma.owner.findUnique({
      where: { id: ownerId },
      include: {
        user: true,
        stands: { select: { id: true, name: true, slug: true } },
      },
    }),
    audRatesFromMarket(),
    platformFeesByOwner([ownerId]),
  ]);
  if (!owner) notFound();

  const fees = feesByOwner.get(owner.id) ?? [];
  const ltvInput = {
    subscriptionCents: owner.lifetimePaidCents,
    billingCurrency: owner.billingCurrency,
    fees,
    rates: fx,
  };

  return (
    <main className="flex flex-col gap-8">
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

      <section className="dash-card space-y-2 p-5 text-sm">
        <p>
          Owner ID: <code className="text-xs">{owner.id}</code>
        </p>
        <p>Plan: {owner.subscriptionPlan ?? "-"}</p>
        <p>Status: {owner.subscriptionStatus.toLowerCase()}</p>
        {owner.lifetimeAccess ? (
          <p className="font-semibold text-[var(--leaf)]">Free for Life</p>
        ) : null}
        <p>LTV: {formatOwnerLtv(ltvInput)}</p>
        <p>
          Fees {formatFeeBuckets(fees, fx)} · Subscriptions{" "}
          {formatBillingWithAud(
            owner.lifetimePaidCents,
            owner.billingCurrency,
            fx,
          )}
        </p>
        <p>
          Plan price:{" "}
          {formatBillingWithAud(
            owner.monthlyFeeCents,
            owner.billingCurrency,
            fx,
          )}
          /mo
        </p>
        <p>
          Stripe customer:{" "}
          {owner.stripeCustomerId ? (
            <code className="text-xs">{owner.stripeCustomerId}</code>
          ) : (
            "-"
          )}
        </p>
        <p>
          Subscription:{" "}
          {owner.stripeSubscriptionId ? (
            <code className="text-xs">{owner.stripeSubscriptionId}</code>
          ) : (
            "-"
          )}
        </p>
        <p>
          Stalls:{" "}
          {owner.stands.length === 0
            ? "None"
            : owner.stands.map((s) => `${s.name} (/${s.slug})`).join(", ")}
        </p>
      </section>

      <OwnerPaymentLedger
        ownerId={owner.id}
        stripeCustomerId={owner.stripeCustomerId}
        stripeAccountId={owner.stripeAccountId}
      />
      <AdminOwnerTools ownerId={owner.id} />
      <AdminDeleteOwnerButton
        ownerId={owner.id}
        businessName={owner.businessName}
        email={owner.user.email}
      />
    </main>
  );
}
