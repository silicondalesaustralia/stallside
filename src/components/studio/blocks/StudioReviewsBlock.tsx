import type { StudioMetadata } from "@/lib/studio/types";
import StudioSectionHeading from "@/components/studio/StudioSectionHeading";
import SectionElement from "@/components/studio/SectionElement";
import ReviewCard from "@/components/storefront/reviews/ReviewCard";
import ReviewForm from "@/components/storefront/reviews/ReviewForm";
import ReviewStars from "@/components/storefront/reviews/ReviewStars";

type Props = {
  preset: "cards" | "quote" | "featured";
  heading: string;
  maxItems: number;
  /** "Leave a review" form under the reviews; on unless switched off. */
  showForm?: boolean;
  metadata: StudioMetadata;
  isEditing?: boolean;
  editable?: boolean;
};

export default function StudioReviewsBlock({
  preset,
  heading,
  maxItems,
  showForm = true,
  metadata: meta,
  isEditing,
  editable = false,
}: Props) {
  const reviews = meta.reviews.slice(0, Math.max(1, Math.min(maxItems, 8)));
  const title = (
    <StudioSectionHeading
      editable={editable}
      value={heading}
      fallback="What customers say"
      placeholder="Reviews heading"
    />
  );
  const form = showForm ? (
    <div className="mx-auto mt-8 max-w-xl">
      <ReviewForm storefrontSlug={meta.storefrontSlug} />
    </div>
  ) : null;

  if (reviews.length === 0) {
    if (!isEditing && !form) return null;
    return (
      <section className="studio-section">
        <div className="studio-section__inner">
          {title}
          {isEditing ? (
            <p className="mt-3 rounded-xl border border-dashed border-[var(--line)] bg-[var(--wash)] p-6 text-sm text-[var(--muted)]">
              No reviews yet. Reviews you approve under Marketing → Reviews appear here.
            </p>
          ) : null}
          {form}
        </div>
      </section>
    );
  }

  if (preset === "featured" && reviews[0]) {
    const r = reviews[0];
    return (
      <section className="studio-section studio-section--panel">
        <div className="studio-section__inner mx-auto max-w-[var(--studio-prose-max)] text-center">
          {title}
          <blockquote className="mt-8">
            <ReviewStars rating={r.rating} />
            <SectionElement el="reviewBody" className="mt-4 text-xl leading-relaxed text-[var(--field)] sf-sm:text-2xl">
              &ldquo;{r.body}&rdquo;
            </SectionElement>
            <SectionElement el="reviewName" className="mt-4 text-sm text-[var(--muted)]">
              — {r.customerName}
            </SectionElement>
          </blockquote>
          <div className="text-left">{form}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="studio-section">
      <div className="studio-section__inner">
        {title}
        <ul className={`mt-8 grid gap-4 ${preset === "quote" ? "grid-cols-1" : "sf-sm:grid-cols-2"}`}>
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </ul>
        {form}
      </div>
    </section>
  );
}
