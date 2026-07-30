import { redirect } from "next/navigation";
import { PaymentStatus } from "@/generated/prisma/client";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ownerHasCardTierAccess } from "@/lib/owner-trial";
import { formatCollectionLabel } from "@/lib/pre-order";
import CollectionDaySection from "./CollectionDaySection";
import CollectionsPrintButton from "./CollectionsPrintButton";

export default async function CollectionsPage() {
  const { owner, user } = await requireOwner();
  if (
    !ownerHasCardTierAccess(owner, { email: user.email, role: user.role })
  ) {
    redirect("/dashboard/orders");
  }

  const orders = await prisma.order.findMany({
    where: {
      ownerId: owner.id,
      isPreOrder: true,
      paymentStatus: PaymentStatus.PAID,
      collectionAt: { not: null },
    },
    orderBy: [{ collectionAt: "asc" }, { createdAt: "asc" }],
    include: {
      items: true,
      stand: { select: { name: true } },
    },
  });

  const groups = new Map<
    string,
    {
      key: string;
      label: string;
      orders: typeof orders;
      itemCount: number;
    }
  >();

  for (const order of orders) {
    const at = order.collectionAt!;
    const key = at.toISOString().slice(0, 10);
    const existing = groups.get(key);
    const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
    if (existing) {
      existing.orders.push(order);
      existing.itemCount += itemCount;
    } else {
      groups.set(key, {
        key,
        label: formatCollectionLabel(at),
        orders: [order],
        itemCount,
      });
    }
  }

  const days = [...groups.values()];

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Collections</h1>
          <p className="mt-1 text-[var(--muted)] print:hidden">
            Who&apos;s collecting what, by date.
          </p>
        </div>
        {days.length > 0 ? <CollectionsPrintButton /> : null}
      </div>

      {days.length === 0 ? (
        <p className="text-[var(--muted)]">No paid pre-orders yet.</p>
      ) : (
        <div className="flex flex-col gap-10">
          {days.map((day) => (
            <CollectionDaySection
              key={day.key}
              dayKey={day.key}
              label={day.label}
              itemCount={day.itemCount}
              orders={day.orders}
            />
          ))}
        </div>
      )}
    </main>
  );
}
