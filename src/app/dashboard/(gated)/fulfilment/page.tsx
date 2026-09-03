import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { normalizeBusinessMode } from "@/lib/business-mode";

export default async function FulfilmentHubPage() {
  const { owner } = await requireOwner();
  const mode = normalizeBusinessMode(owner.businessMode);

  const [locations, options, zones] = await Promise.all([
    prisma.pickupLocation.count({ where: { ownerId: owner.id, isActive: true } }),
    prisma.fulfilmentOption.count({
      where: {
        ownerId: owner.id,
        isActive: true,
        kind: { not: "STAND_IMMEDIATE" },
      },
    }),
    prisma.deliveryZone.count({ where: { ownerId: owner.id, isActive: true } }),
  ]);

  return (
    <main className="flex flex-col gap-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          Fulfilment
        </h1>
        <p className="mt-1 max-w-2xl text-[var(--muted)]">
          Pickup locations, schedules and delivery zones for your online shop
          and pre-orders. Farm-stand QR sales work instantly — no setup required.
        </p>
      </div>

      {mode === "FARM_STAND" && options === 0 && zones === 0 ? (
        <div className="dash-card p-6">
          <p className="font-medium text-[var(--field)]">
            Your QR stand is ready to sell
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Customers scan and pay at your stand with no pickup scheduling. Add
            pickup or delivery here when you launch online ordering.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/dashboard/fulfilment/orders"
          className="dash-card p-5 hover:border-[var(--leaf)]"
        >
          <p className="font-semibold">Orders board</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Pack, ready, collect or deliver
          </p>
        </Link>
        <Link href="/dashboard/fulfilment/locations" className="dash-card p-5 hover:border-[var(--leaf)]">
          <p className="text-2xl font-bold text-[var(--field)]">{locations}</p>
          <p className="mt-1 font-semibold">Pickup locations</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Markets, farm gate, home pickup</p>
        </Link>
        <Link href="/dashboard/fulfilment/pickup" className="dash-card p-5 hover:border-[var(--leaf)]">
          <p className="text-2xl font-bold text-[var(--field)]">{options}</p>
          <p className="mt-1 font-semibold">Pickup schedules</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Windows, cutoffs and fees</p>
        </Link>
        <Link href="/dashboard/fulfilment/delivery" className="dash-card p-5 hover:border-[var(--leaf)]">
          <p className="text-2xl font-bold text-[var(--field)]">{zones}</p>
          <p className="mt-1 font-semibold">Delivery zones</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Suburbs and postcodes</p>
        </Link>
      </div>

      <p className="text-sm text-[var(--muted)]">
        Pre-order day lists also live under{" "}
        <Link href="/dashboard/collections" className="underline">
          Collections
        </Link>
        .
      </p>
    </main>
  );
}
