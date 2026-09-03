import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import DashPrimaryCta from "@/components/DashPrimaryCta";

export default async function EventsPage() {
  const { owner } = await requireOwner();
  const events = await prisma.sellerEvent.findMany({
    where: { ownerId: owner.id },
    orderBy: { startsAt: "desc" },
    include: {
      stand: { select: { name: true } },
      _count: { select: { orders: true, products: true } },
    },
    take: 50,
  });

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--muted)]">
            <Link href="/dashboard/operate" className="underline">
              Operate
            </Link>
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Markets &amp; events
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            Soft allocations and cash quick sales at markets.
          </p>
        </div>
        <DashPrimaryCta href="/dashboard/events/new">+ New event</DashPrimaryCta>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No events yet.</p>
      ) : (
        <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {events.map((e) => (
            <li
              key={e.id}
              className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm"
            >
              <div>
                <Link
                  href={`/dashboard/events/${e.id}`}
                  className="font-medium underline"
                >
                  {e.name}
                </Link>
                <p className="mt-1 text-[var(--muted)]">
                  {e.status} · {e.stand.name} ·{" "}
                  {e.startsAt.toLocaleString()} · {e._count.products} products ·{" "}
                  {e._count.orders} sales
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
