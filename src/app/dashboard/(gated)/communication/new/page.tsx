import { requireOwner } from "@/lib/session";
import Link from "next/link";
import CommunicationComposer from "./CommunicationComposer";
import { loadComposeOptions } from "@/lib/communication/load";
import { listOwnerListMembers } from "@/lib/communication/audience";

export default async function NewCommunicationPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string; listId?: string }>;
}) {
  const { owner } = await requireOwner();
  const { customerId, listId } = await searchParams;
  const { customers, products, lists, preOrderPages } =
    await loadComposeOptions(owner.id);

  const initialListMembers = listId
    ? ((await listOwnerListMembers(owner.id, listId)) ?? []).map((email) => ({
        email,
      }))
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
