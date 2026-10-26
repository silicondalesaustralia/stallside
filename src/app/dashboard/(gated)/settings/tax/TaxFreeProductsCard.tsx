import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DetailCard from "@/components/dashboard/ui/DetailCard";

const SHOWN = 12;

export default async function TaxFreeProductsCard({ ownerId, taxName }: { ownerId: string; taxName: string }) {
  const where = { ownerId, gstFree: true, isArchived: false };
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { name: "asc" },
      take: SHOWN,
      select: { id: true, name: true, stand: { select: { name: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  return (
    <DetailCard title={`${taxName}-free products`}>
      <p className="mb-3 text-sm text-[var(--muted)]">
        Fresh produce and other exempt or zero-rated goods. Turn this on from each product&apos;s page.
      </p>
      {products.length ? (
        <ul className="divide-y divide-[var(--line)] text-sm">
          {products.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 py-1.5">
              <Link href={`/dashboard/products/${p.id}`} className="font-medium hover:underline">
                {p.name}
              </Link>
              <span className="text-xs text-[var(--muted)]">{p.stand.name}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm">No products are marked {taxName}-free.</p>
      )}
      {total > SHOWN ? (
        <p className="mt-2 text-xs text-[var(--muted)]">and {total - SHOWN} more</p>
      ) : null}
    </DetailCard>
  );
}
