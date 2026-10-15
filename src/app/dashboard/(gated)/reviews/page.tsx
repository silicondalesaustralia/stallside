import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import ReviewItem from "./ReviewItem";

const TABS = [
  { id: "pending", label: "Waiting for approval", status: "PENDING" },
  { id: "approved", label: "Published", status: "APPROVED" },
  { id: "hidden", label: "Hidden", status: "REJECTED" },
  { id: "all", label: "All", status: null },
] as const;

const NOTICES: Record<string, string> = {
  approved: "Review published.",
  hidden: "Review hidden from your website.",
  pending: "Review moved back to waiting.",
  deleted: "Review deleted.",
  replied: "Reply saved. It shows under the review on your website.",
  "reply-removed": "Reply removed.",
  emailed: "Email sent. Their reply will come to your inbox.",
  "email-missing": "Add a subject and message, and make sure the reviewer left an email.",
  "email-failed": "Couldn't send that email. Try again.",
  missing: "That review couldn't be found.",
};

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; done?: string }>;
}) {
  const { owner } = await requireOwner();
  const { tab: rawTab, done } = await searchParams;
  const grouped = await prisma.review.groupBy({ by: ["status"], where: { ownerId: owner.id }, _count: true });
  const counts = Object.fromEntries(grouped.map((g) => [g.status, g._count]));
  const tab = TABS.find((t) => t.id === rawTab) ?? (counts.PENDING ? TABS[0] : TABS[3]);

  const reviews = await prisma.review.findMany({
    where: { ownerId: owner.id, ...(tab.status ? { status: tab.status } : {}) },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      rating: true,
      title: true,
      body: true,
      status: true,
      authorName: true,
      authorEmail: true,
      verified: true,
      sellerReply: true,
      createdAt: true,
      productId: true,
      customer: { select: { id: true, name: true, email: true } },
    },
  });
  const productIds = [...new Set(reviews.map((r) => r.productId).filter((id): id is string => Boolean(id)))];
  const products = await prisma.product.findMany({ where: { id: { in: productIds }, ownerId: owner.id }, select: { id: true, name: true } });
  const productName = new Map(products.map((p) => [p.id, p.name]));

  return (
    <main className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">Reviews</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Customers leave reviews on your website. Approve them to publish, reply publicly, or email the reviewer.
        </p>
      </div>
      {done && NOTICES[done] ? <p className="text-sm font-medium text-[var(--ok)]">{NOTICES[done]}</p> : null}
      <nav className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const count = t.status ? counts[t.status] ?? 0 : Object.values(counts).reduce((a, b) => a + b, 0);
          return (
            <Link
              key={t.id}
              href={`/dashboard/reviews?tab=${t.id}`}
              className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
                t.id === tab.id ? "border-[var(--field)] bg-[var(--field)] text-white" : "border-[var(--line)] bg-white"
              }`}
            >
              {t.label} ({count})
            </Link>
          );
        })}
      </nav>
      {reviews.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--line)] bg-white p-6 text-sm text-[var(--muted)]">
          No reviews here yet. Turn on &ldquo;Let customers leave a review&rdquo; in the Reviews section or on your
          product page in Web Studio.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {reviews.map((r) => (
            <ReviewItem key={r.id} review={r} productName={r.productId ? productName.get(r.productId) ?? "A product" : null} tab={tab.id} />
          ))}
        </ul>
      )}
    </main>
  );
}
