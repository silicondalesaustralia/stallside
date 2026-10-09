import { prisma } from "@/lib/prisma";

/** Approved reviews only — never show PENDING/REJECTED publicly. */
export async function ProductApprovedReviews({
  ownerId,
  productId,
}: {
  ownerId: string;
  productId: string;
}) {
  const reviews = await prisma.review.findMany({
    where: {
      ownerId,
      productId,
      status: "APPROVED",
      rating: { gte: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      rating: true,
      title: true,
      body: true,
      createdAt: true,
      customer: { select: { name: true } },
    },
  });

  if (reviews.length === 0) return null;

  return (
    <section className="mt-10 border-t border-[var(--line)] pt-8">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight">
        Customer reviews
      </h2>
      <ul className="mt-4 flex flex-col gap-4">
        {reviews.map((r) => (
          <li key={r.id} className="text-sm">
            <p className="font-semibold">
              {"★".repeat(r.rating)}
              {"☆".repeat(5 - r.rating)}
              {r.title ? (
                <span className="ml-2 text-[var(--field)]">{r.title}</span>
              ) : null}
            </p>
            <p className="mt-1 leading-relaxed text-[var(--muted)]">{r.body}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {r.customer?.name?.trim() || "Customer"} ·{" "}
              {r.createdAt.toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
