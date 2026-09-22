import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  countSegmentAudience,
  describeSegmentRules,
  parseSegmentRules,
} from "@/lib/crm/segments";
import { STANDING_LIST_PRESET_KEYS } from "@/lib/crm/segment-rules";
import { archiveList } from "./actions";

export default async function CustomerListsPage() {
  const { owner } = await requireOwner();

  const lists = await prisma.customerSegment.findMany({
    where: {
      ownerId: owner.id,
      isActive: true,
      NOT: { presetKey: { in: [...STANDING_LIST_PRESET_KEYS] } },
    },
    orderBy: { createdAt: "desc" },
  });

  const counts = await Promise.all(
    lists.map(async (list) => ({
      id: list.id,
      count: await countSegmentAudience(
        owner.id,
        parseSegmentRules(list.rules),
      ),
      summary: describeSegmentRules(parseSegmentRules(list.rules)),
    })),
  );
  const byId = Object.fromEntries(counts.map((c) => [c.id, c]));

  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--muted)]">
            <Link href="/dashboard/customers" className="underline">
              Customers
            </Link>
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
            Lists
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            Group customers by purchases, pre-orders, or a CSV upload — then
            email them from Communication. Restock opt-ins live under
            Communication.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/customers/lists/new"
            className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold"
          >
            From rules
          </Link>
          <Link
            href="/dashboard/customers/lists/upload"
            className="rounded-full bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white"
          >
            Upload CSV
          </Link>
        </div>
      </div>

      {lists.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          No lists yet. Create one from product / pre-order rules, or upload a
          CSV of emails.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {lists.map((list) => (
            <li
              key={list.id}
              className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm"
            >
              <div>
                <p className="font-medium">{list.name}</p>
                <p className="mt-1 text-[var(--muted)]">
                  {byId[list.id]?.summary} · {byId[list.id]?.count ?? 0}{" "}
                  contacts
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/dashboard/communication/new?listId=${list.id}`}
                  className="font-medium text-[var(--leaf-dark)] underline"
                >
                  Email
                </Link>
                <form action={archiveList}>
                  <input type="hidden" name="id" value={list.id} />
                  <button type="submit" className="text-[var(--muted)] underline">
                    Archive
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
