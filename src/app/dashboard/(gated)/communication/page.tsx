import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ensureStandingLists } from "@/lib/crm/standing-lists";
import {
  countSegmentAudience,
  parseSegmentRules,
} from "@/lib/crm/segments";
import { STANDING_LIST_PRESET_KEYS } from "@/lib/crm/segment-rules";

export default async function CommunicationPage() {
  const { owner } = await requireOwner();
  await ensureStandingLists(owner.id);

  const [campaigns, standingLists] = await Promise.all([
    prisma.campaign.findMany({
      where: { ownerId: owner.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.customerSegment.findMany({
      where: {
        ownerId: owner.id,
        isActive: true,
        presetKey: { in: [...STANDING_LIST_PRESET_KEYS] },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const standingCounts = await Promise.all(
    standingLists.map(async (list) => ({
      id: list.id,
      count: await countSegmentAudience(
        owner.id,
        parseSegmentRules(list.rules),
      ),
    })),
  );
  const countById = Object.fromEntries(
    standingCounts.map((c) => [c.id, c.count]),
  );

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
                    {list.description} · {countById[list.id] ?? 0} contacts
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
