import Link from "next/link";
import { notFound } from "next/navigation";
import BrandLockup from "@/components/BrandLockup";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { intervalLabel } from "@/lib/subscription-offer";
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
          {sub.offer.title} · {intervalLabel(sub.offer.interval)} ·{" "}
          {formatMoney(sub.offer.priceCents, sub.offer.currency)}
        </p>
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
      />
    </main>
  );
}
