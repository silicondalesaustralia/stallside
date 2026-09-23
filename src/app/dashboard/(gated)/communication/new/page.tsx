import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CommunicationComposer from "./CommunicationComposer";
import { ensureStandingLists } from "@/lib/crm/standing-lists";
import { resolveCampaignAudience } from "@/lib/grow/campaigns";
import { listEmailableCustomers } from "@/lib/crm/list-emailable-customers";

export default async function NewCommunicationPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string; listId?: string }>;
}) {
  const { owner } = await requireOwner();
  const { customerId, listId } = await searchParams;
  await ensureStandingLists(owner.id);

  const [customers, products, lists, preOrderPages] = await Promise.all([
    listEmailableCustomers(owner.id),
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
    prisma.preOrderPage.findMany({
      where: { ownerId: owner.id },
      orderBy: [{ isActive: "desc" }, { collectionAt: "desc" }],
      take: 100,
      select: { id: true, title: true },
    }),
  ]);

  const initialListMembers = listId
    ? (
        await resolveCampaignAudience({
          ownerId: owner.id,
          audienceType: "list",
          audienceRefId: listId,
        })
      ).map((m) => ({ email: m.email }))
    : [];

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
          For lists, review emails and include or exclude before sending.
        </p>
      </div>
      <CommunicationComposer
        customers={customers}
        products={products}
        lists={lists}
        preOrderPages={preOrderPages}
        initialCustomerId={customerId ?? null}
        initialListId={listId ?? null}
        initialListMembers={initialListMembers}
      />
    </main>
  );
}
