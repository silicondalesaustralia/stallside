import type { StorefrontReviewView } from "@/lib/studio/load-reviews";
import SectionCopy from "@/components/studio/SectionCopy";
import SectionElement from "@/components/studio/SectionElement";
import ReviewStars from "./ReviewStars";

/** One published review; parts take the section's "Text elements" styles. */
export default function ReviewCard({ review, className = "" }: { review: StorefrontReviewView; className?: string }) {
  return (
    <li className={`rounded-[var(--studio-card-radius)] border border-[var(--line)] bg-white p-5 ${className}`}>
      <ReviewStars rating={review.rating} />
      {review.title ? (
        <SectionElement el="reviewTitle" className="mt-2 font-semibold text-[var(--field)]">
          {review.title}
        </SectionElement>
      ) : null}
      <SectionElement el="reviewBody" className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--muted)]">
        {review.body}
      </SectionElement>
      <SectionElement el="reviewName" className="mt-3 text-xs font-medium text-[var(--field)]">
        {review.customerName}
        {review.verified ? (
          <span className="ml-2 rounded-full bg-[var(--wash)] px-2 py-0.5 text-[11px] font-semibold text-[var(--leaf-dark)]">
            ✓ <SectionCopy k="verifiedBuyer" fallback="Verified buyer" />
          </span>
        ) : null}
      </SectionElement>
      {review.reply ? (
        <SectionElement el="reviewReply" as="div" className="mt-3 rounded-lg bg-[var(--wash)] p-3 text-sm text-[var(--field)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            <SectionCopy k="ownerReply" fallback="Reply from the owner" />
          </p>
          <p className="mt-1 whitespace-pre-line leading-relaxed">{review.reply}</p>
        </SectionElement>
      ) : null}
    </li>
  );
}
