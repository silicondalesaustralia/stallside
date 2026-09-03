import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { approveReview, rejectReview } from "./actions";

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { owner } = await requireOwner();
  const sp = await searchParams;
  const statusFilter =
    sp.status === "APPROVED" || sp.status === "REJECTED" || sp.status === "PENDING"
      ? sp.status
      : "PENDING";

  const reviews = await prisma.review.findMany({
    where: { ownerId: owner.id, status: statusFilter },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      customer: { select: { name: true, email: true } },
    },
  });

  return (
    <main className="flex flex-col gap-8">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/marketing" className="underline">
            Grow
          </Link>
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Reviews</h1>
        <p className="mt-1 text-[var(--muted)]">
          Approve customer feedback before it appears publicly.
        </p>
      </div>

      <nav className="flex flex-wrap gap-3 text-sm">
        {(["PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
          <Link
            key={s}
            href={`/dashboard/reviews?status=${s}`}
            className={
              statusFilter === s
                ? "font-semibold text-[var(--leaf-dark)]"
                : "underline text-[var(--muted)]"
            }
          >
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </Link>
        ))}
      </nav>

      {reviews.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          No {statusFilter.toLowerCase()} reviews.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {reviews.map((r) => (
            <li key={r.id} className="flex flex-col gap-2 py-4 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-medium">
                  {"★".repeat(Math.min(5, Math.max(0, r.rating)))}{" "}
                  {r.title || "Review"}
                </p>
                <span className="text-[var(--muted)]">
                  {r.customer?.name || r.customer?.email || "Customer"}
                </span>
              </div>
              <p className="text-[var(--muted)] whitespace-pre-wrap">{r.body}</p>
              {r.status === "PENDING" ? (
                <div className="flex gap-3">
                  <form action={approveReview}>
                    <input type="hidden" name="id" value={r.id} />
                    <button
                      type="submit"
                      className="font-semibold text-[var(--leaf-dark)] underline"
                    >
                      Approve
                    </button>
                  </form>
                  <form action={rejectReview}>
                    <input type="hidden" name="id" value={r.id} />
                    <button type="submit" className="text-[var(--muted)] underline">
                      Reject
                    </button>
                  </form>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
