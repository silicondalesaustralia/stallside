import Link from "next/link";
import { deleteReview, emailReviewer, saveReviewReply, setReviewStatus } from "./actions";
import { REVIEW_REPLY_MAX } from "@/lib/reviews/review-fields";

type Review = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  authorName: string | null;
  authorEmail: string | null;
  verified: boolean;
  sellerReply: string | null;
  createdAt: Date;
  customer: { id: string; name: string | null; email: string | null } | null;
};

const BTN = "rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 text-sm font-semibold";
const INPUT = "w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm";
const STATUS = {
  PENDING: { label: "Waiting for approval", tone: "bg-amber-100 text-amber-900" },
  APPROVED: { label: "Published", tone: "bg-green-100 text-green-900" },
  REJECTED: { label: "Hidden", tone: "bg-gray-100 text-gray-700" },
} as const;

/** One review in the dashboard: approve/hide, public reply, email the reviewer, delete. */
export default function ReviewItem({ review: r, productName, tab }: { review: Review; productName: string | null; tab: string }) {
  const name = r.authorName || r.customer?.name || "Customer";
  const email = r.authorEmail || r.customer?.email;
  const status = STATUS[r.status];
  return (
    <li className="flex flex-col gap-3 rounded-xl border border-[var(--line)] bg-white p-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-lg text-amber-500" aria-label={`${r.rating} out of 5 stars`}>
          {"★".repeat(r.rating)}
          <span className="text-gray-300">{"★".repeat(5 - r.rating)}</span>
        </span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${status.tone}`}>{status.label}</span>
        <span className="text-[var(--muted)]">{productName ? `on ${productName}` : "about your business"}</span>
        <span className="ml-auto text-xs text-[var(--muted)]">{r.createdAt.toLocaleDateString()}</span>
      </div>
      {r.title ? <p className="font-semibold">{r.title}</p> : null}
      <p className="whitespace-pre-line text-sm leading-relaxed">{r.body}</p>
      <p className="text-sm text-[var(--muted)]">
        {r.customer ? <Link href={`/dashboard/customers/${r.customer.id}`} className="font-semibold underline">{name}</Link> : <span className="font-semibold">{name}</span>}
        {email ? ` · ${email}` : ""}
        {r.verified ? <span className="ml-2 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-800">✓ Verified buyer</span> : null}
      </p>

      <div className="flex flex-wrap gap-2">
        {r.status !== "APPROVED" ? (
          <form action={setReviewStatus.bind(null, r.id, "APPROVED", tab)}>
            <button type="submit" className="rounded-lg bg-[var(--leaf)] px-3 py-1.5 text-sm font-semibold text-white">Approve &amp; publish</button>
          </form>
        ) : null}
        {r.status !== "REJECTED" ? (
          <form action={setReviewStatus.bind(null, r.id, "REJECTED", tab)}>
            <button type="submit" className={BTN}>Hide</button>
          </form>
        ) : null}
        <form action={deleteReview.bind(null, r.id, tab)}>
          <button type="submit" className={`${BTN} text-[var(--gone)]`}>Delete</button>
        </form>
      </div>

      <details className="rounded-lg border border-[var(--line)] p-3" open={Boolean(r.sellerReply)}>
        <summary className="cursor-pointer text-sm font-semibold">{r.sellerReply ? "Your public reply" : "Reply publicly"}</summary>
        <form action={saveReviewReply.bind(null, r.id, tab)} className="mt-2 flex flex-col gap-2">
          <textarea name="reply" rows={3} maxLength={REVIEW_REPLY_MAX} defaultValue={r.sellerReply ?? ""} className={INPUT} placeholder="Thanks so much for…" />
          <p className="text-xs text-[var(--muted)]">Shows under the review on your website once it&apos;s published. Clear it and save to remove.</p>
          <button type="submit" className={`${BTN} self-start`}>Save reply</button>
        </form>
      </details>

      {email ? (
        <details className="rounded-lg border border-[var(--line)] p-3">
          <summary className="cursor-pointer text-sm font-semibold">Email {name}</summary>
          <form action={emailReviewer.bind(null, r.id, tab)} className="mt-2 flex flex-col gap-2">
            <input name="subject" required maxLength={150} defaultValue="Thanks for your review" className={INPUT} />
            <textarea name="message" required rows={4} maxLength={5000} className={INPUT} placeholder={`Hi ${name},`} />
            <p className="text-xs text-[var(--muted)]">Sent privately to {email}. Their reply comes to your email.</p>
            <button type="submit" className={`${BTN} self-start`}>Send email</button>
          </form>
        </details>
      ) : null}
    </li>
  );
}
