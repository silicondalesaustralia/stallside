import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { countOwnerReviews, listOwnerReviews } from "@/lib/reviews/service";
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
  const counts = await countOwnerReviews(owner.id);
  const tab = TABS.find((t) => t.id === rawTab) ?? (counts.PENDING ? TABS[0] : TABS[3]);
  const reviews = await listOwnerReviews(owner.id, tab.status);

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
          const count = t.status ? counts[t.status] ?? 0 : Object.values(counts).reduce((a, b) => a + (b ?? 0), 0);
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
            <ReviewItem key={r.id} review={r} productName={r.productName} tab={tab.id} />
          ))}
        </ul>
      )}
    </main>
  );
}
