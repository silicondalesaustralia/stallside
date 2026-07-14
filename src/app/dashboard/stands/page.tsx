import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function StandsPage() {
  const { owner } = await requireOwner();
  const stands = await prisma.stand.findMany({
    where: { ownerId: owner.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">My stands</h1>
          <p className="mt-1 text-[var(--muted)]">
            Open a stand anytime to edit details or print its QR code.
          </p>
        </div>
        <Link
          href="/dashboard/stands/new"
          className="rounded-lg bg-[var(--leaf)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
        >
          New stand
        </Link>
      </div>

      {stands.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No stands yet. Create your first one.</p>
      ) : (
        <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {stands.map((stand) => (
            <li key={stand.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <Link
                  href={`/dashboard/stands/${stand.id}`}
                  className="font-medium text-[var(--ink)] hover:underline"
                >
                  {stand.name}
                </Link>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  /s/{stand.slug} · {stand.currency} · {stand._count.products} products ·{" "}
                  {stand.isActive ? "Live" : "Disabled"}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <Link
                  href={`/dashboard/stands/${stand.id}/qr`}
                  className="font-semibold text-[var(--leaf-dark)] underline"
                >
                  QR &amp; print
                </Link>
                <Link href={`/dashboard/stands/${stand.id}`} className="underline">
                  Manage
                </Link>
                <Link href={`/s/${stand.slug}`} className="underline" target="_blank">
                  Checkout
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
