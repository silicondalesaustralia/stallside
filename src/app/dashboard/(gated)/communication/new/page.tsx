import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CommunicationComposer from "./CommunicationComposer";

export default async function NewCommunicationPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string; listId?: string }>;
}) {
  const { owner } = await requireOwner();
  const { customerId, listId } = await searchParams;

  const [customers, products, lists] = await Promise.all([
    prisma.customer.findMany({
      where: { ownerId: owner.id, email: { not: null } },
      orderBy: { updatedAt: "desc" },
      take: 300,
      select: { id: true, name: true, email: true },
    }),
    prisma.product.findMany({
      where: { ownerId: owner.id, isArchived: false, isHidden: false },
      orderBy: { name: "asc" },
      take: 300,
      select: { id: true, name: true },
    }),
    prisma.customerSegment.findMany({
      where: { ownerId: owner.id, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <main className="flex max-w-2xl flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/communication" className="underline">
            Communication
          </Link>
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          New message
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Broadcasts use marketing opt-ins. Lists, product buyers, and
          single-customer sends skip suppressed addresses.
        </p>
      </div>
      <CommunicationComposer
        customers={customers}
        products={products}
        lists={lists}
        initialCustomerId={customerId ?? null}
        initialListId={listId ?? null}
      />
    </main>
  );
}
