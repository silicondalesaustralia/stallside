import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function AdminStandsPage() {
  await requireAdmin();
  const stands = await prisma.stand.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: true,
      _count: { select: { products: true, orders: true } },
    },
  });

  return (
    <main className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Stands</h1>
        <p className="mt-1 text-[var(--muted)]">All public checkout stands.</p>
      </div>
      {stands.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No stands yet.</p>
      ) : (
        <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
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
    </main>
  );
}
