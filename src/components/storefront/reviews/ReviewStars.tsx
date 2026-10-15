import SectionElement from "@/components/studio/SectionElement";

/** Filled and empty stars for a 1–5 rating; colour comes from the section's "Stars" style. */
export default function ReviewStars({ rating }: { rating: number }) {
  return (
    <SectionElement el="stars" as="span" className="studio-stars">
      <span aria-label={`${rating} out of 5 stars`}>
        {"★".repeat(rating)}
        <span className="opacity-25">{"★".repeat(5 - rating)}</span>
      </span>
    </SectionElement>
  );
}
