import Link from "next/link";
import { notFound } from "next/navigation";
import BrandLockup from "@/components/BrandLockup";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import {
  intervalLabel,
  membershipPlanLabel,
  offerDisplayPriceCents,
} from "@/lib/subscription-offer";
import { SubscriptionOfferKind } from "@/generated/prisma/client";
import SubscriptionManageControls from "../SubscriptionManageControls";

export default async function ShopperSubscriptionManagePage({
  params,
}: {
  params: Promise<{ standSlug: string; token: string }>;
}) {
  const { standSlug, token } = await params;
  const standKey = decodeURIComponent(standSlug).trim().toLowerCase();
  const manageToken = decodeURIComponent(token).trim();

  const sub = await prisma.shopperSubscription.findFirst({
    where: {
      manageToken,
      stand: { slug: standKey },
    },
    include: {
      offer: true,
      stand: { select: { name: true, slug: true } },
    },
  });
  if (!sub) notFound();

  const isMembership = sub.offer.kind === SubscriptionOfferKind.MEMBERSHIP;

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between gap-3">
        <BrandLockup href="/" size="sm" />
        <Link
          href={`/s/${sub.stand.slug}`}
          className="text-sm font-semibold text-[var(--leaf-dark)] underline"
        >
          {sub.stand.name}
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Manage subscription
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {sub.offer.title} ·{" "}
          {isMembership
            ? `${sub.offer.termWeeks ?? "?"} week membership`
            : intervalLabel(sub.offer.interval)}{" "}
          ·{" "}
          {formatMoney(
            offerDisplayPriceCents(sub.offer),
            sub.offer.currency,
          )}
        </p>
        {isMembership && sub.billingPlan ? (
          <p className="mt-1 text-sm text-[var(--muted)]">
            Paying {membershipPlanLabel(sub.billingPlan).toLowerCase()}
            {sub.collectionsRemaining != null
              ? ` · ${sub.collectionsRemaining} collections left`
              : ""}
            {sub.termEndsAt
              ? ` · ends ${sub.termEndsAt.toLocaleDateString()}`
              : ""}
          </p>
        ) : null}
        {isMembership && sub.billingPlan === "UPFRONT" ? (
          <p className="mt-2 text-sm text-[var(--muted)]">
            You paid in full. For changes or cancellations, contact the farm
            using the terms on the membership page.
          </p>
        ) : null}
        <p className="mt-1 text-sm">
          {sub.customerName} · {sub.customerEmail}
        </p>
        <p className="mt-1 text-sm capitalize text-[var(--muted)]">
          Status: {sub.status.toLowerCase().replaceAll("_", " ")}
          {sub.nextCollectionAt
            ? ` · next ${sub.nextCollectionAt.toLocaleDateString()}`
            : ""}
        </p>
      </div>
      <SubscriptionManageControls
        token={sub.manageToken}
        status={sub.status}
        skipNextCycle={sub.skipNextCycle}
        showBillingPortal={sub.billingPlan !== "UPFRONT"}
      />
    </main>
  );
}
