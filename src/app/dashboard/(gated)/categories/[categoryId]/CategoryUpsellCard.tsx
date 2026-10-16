import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function CategoryUpsellCard({ ownerId, categoryId }: { ownerId: string; categoryId: string }) {
  const upsells = await prisma.upsell.findMany({
    where: { ownerId, categoryIds: { has: categoryId } },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, isActive: true },
  });

  return (
    <section className="dash-card flex flex-col gap-2 p-5">
      <h2 className="font-semibold">Cart upsells for this category</h2>
      {upsells.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          None yet. Shoppers with a product from this category in their cart can be offered an extra item.
        </p>
      ) : (
        <ul className="text-sm">
          {upsells.map((u) => (
            <li key={u.id}>
              <Link href={`/dashboard/upsells/${u.id}`} className="underline">
                {u.name}
              </Link>
              {!u.isActive ? <span className="text-[var(--muted)]"> (off)</span> : null}
            </li>
          ))}
        </ul>
      )}
      <Link href={`/dashboard/upsells/new?category=${categoryId}`} className="text-sm text-[var(--leaf-dark)] underline">
        + Add an upsell for this category
      </Link>
    </section>
  );
}
