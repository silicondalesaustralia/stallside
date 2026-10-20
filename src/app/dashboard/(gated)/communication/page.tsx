import Link from "next/link";
import { requireOwner } from "@/lib/session";
import {
  listOwnerCampaigns,
  listOwnerStandingLists,
} from "@/lib/communication/load";

export default async function CommunicationPage() {
  const { owner } = await requireOwner();
  const [campaigns, standingLists] = await Promise.all([
    listOwnerCampaigns(owner.id),
    listOwnerStandingLists(owner.id),
  ]);

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
            Communication
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            Email opted-in contacts, saved lists, product buyers, or one
            customer.
          </p>
        </div>
        <Link
          href="/dashboard/communication/new"
          className="rounded-full bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white"
        >
          + New message
        </Link>
      </div>

      {standingLists.length > 0 ? (
        <section>
          <h2 className="text-lg font-semibold">Standing lists</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Auto-updating groups — broadcast when you restock or have news.
          </p>
          <ul className="mt-3 divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {standingLists.map((list) => (
              <li
                key={list.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm"
              >
                <div>
                  <p className="font-medium">{list.name}</p>
                  <p className="mt-1 text-[var(--muted)]">
                    {list.description} · {list.count} contacts
                  </p>
                </div>
                <Link
                  href={`/dashboard/communication/new?listId=${list.id}`}
                  className="font-medium text-[var(--leaf-dark)] underline"
                >
                  Broadcast
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="text-lg font-semibold">Messages</h2>
        {campaigns.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted)]">
            No messages yet.{" "}
            <Link href="/dashboard/communication/new" className="underline">
              Compose one
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {campaigns.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm"
              >
                <div>
                  <Link
                    href={`/dashboard/communication/${c.id}`}
                    className="font-medium underline"
                  >
                    {c.name}
                  </Link>
                  <p className="mt-1 text-[var(--muted)]">
                    {c.status} · {c.sentCount}/{c.recipientCount} sent ·{" "}
                    {c.audienceType.replaceAll("_", " ")}
                  </p>
                </div>
                <Link
                  href={`/dashboard/communication/${c.id}`}
                  className="text-[var(--leaf-dark)] underline"
                >
                  Open
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
