import ReviewStars from "@/components/storefront/reviews/ReviewStars";
import SectionElement from "@/components/studio/SectionElement";

/** Average star rating and review count (a category's or a product's); a placeholder in the builder when it has none. */
export default function RatingSummary({
  rating,
  isEditing,
  className = "",
  onDark = false,
}: {
  rating?: { average: number; count: number } | null;
  isEditing?: boolean;
  className?: string;
  onDark?: boolean;
}) {
  const muted = onDark ? "text-white/85" : "text-[var(--muted)]";
  if (!rating || rating.count === 0) {
    if (!isEditing) return null;
    return <p className={`text-xs ${muted} ${className}`}>No reviews yet</p>;
  }
  return (
    <p className={`flex items-center gap-1.5 text-sm ${className}`}>
      <ReviewStars rating={Math.round(rating.average)} />
      <SectionElement el="ratingCount" as="span" className={`text-xs ${muted}`}>
        {rating.average.toFixed(1)} ({rating.count} {rating.count === 1 ? "review" : "reviews"})
      </SectionElement>
    </p>
  );
}
