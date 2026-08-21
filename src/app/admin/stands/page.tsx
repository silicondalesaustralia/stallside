import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 50;

export default async function AdminStandsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [stands, total] = await Promise.all([
    prisma.stand.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: {
        owner: true,
        _count: { select: { products: true, orders: true } },
      },
    }),
    prisma.stand.count(),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Stands</h1>
        <p className="mt-1 text-[var(--muted)]">All public checkout stands.</p>
      </div>
      {stands.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No stands yet.</p>
      ) : (
        <ul className="dash-card divide-y divide-[var(--line)] px-5">
          {stands.map((stand) => (
            <li key={stand.id} className="py-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{stand.name}</p>
                <p className="text-[var(--muted)]">
                  {stand.isActive ? "Live" : "Disabled"} · {stand.currency}
                </p>
              </div>
              <p className="mt-1 text-[var(--muted)]">
                {stand.owner.businessName} · /s/{stand.slug} ·{" "}
                {stand._count.products} products · {stand._count.orders} orders
              </p>
              <Link
                href={`/s/${stand.slug}`}
                className="mt-2 inline-block text-[var(--leaf-dark)] underline"
                target="_blank"
              >
                Open checkout
              </Link>
            </li>
          ))}
        </ul>
      )}
      {pageCount > 1 ? (
        <nav className="flex items-center gap-3 text-sm">
          {page > 1 ? (
            <Link href={`/admin/stands?page=${page - 1}`} className="underline">
              Previous
            </Link>
          ) : (
            <span className="text-[var(--muted)]">Previous</span>
          )}
          <span className="text-[var(--muted)]">
            Page {page} of {pageCount}
          </span>
          {page < pageCount ? (
            <Link href={`/admin/stands?page=${page + 1}`} className="underline">
              Next
            </Link>
          ) : (
            <span className="text-[var(--muted)]">Next</span>
          )}
        </nav>
      ) : null}
    </main>
  );
}
