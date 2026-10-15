"use client";

import type { StorefrontReviewView } from "@/lib/studio/load-reviews";
import SectionCopy from "@/components/studio/SectionCopy";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";

/** Website editor only: how product reviews and the review form will look under every product. */
export default function ProductReviewsPreview({
  reviews,
  storefrontSlug,
  showForm,
}: {
  reviews: StorefrontReviewView[];
  storefrontSlug: string;
  showForm: boolean;
}) {
  const sample = reviews.slice(0, 2);
  return (
    <div className="storefront-page-content storefront-page-content--narrow">
      <section className="mt-10 border-t border-[var(--line)] pt-8">
        <h2 className="studio-heading text-xl">
          <SectionCopy k="reviewsHeading" fallback="Customer reviews" />
        </h2>
        {sample.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-4">
            {sample.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </ul>
        ) : (
          <p className="mt-3 rounded-xl border border-dashed border-[var(--line)] p-4 text-sm text-[var(--muted)]">
            Each product shows its own approved reviews here.
          </p>
        )}
        {showForm ? (
          <div className="mt-6">
            <ReviewForm storefrontSlug={storefrontSlug} />
          </div>
        ) : null}
      </section>
    </div>
  );
}
