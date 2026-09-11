import type { StudioMetadata } from "@/lib/studio/types";
import StudioSectionHeading from "@/components/studio/StudioSectionHeading";

type Props = {
  preset: "cards" | "quote" | "featured";
  heading: string;
  maxItems: number;
  metadata: StudioMetadata;
  isEditing?: boolean;
  editable?: boolean;
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="studio-stars" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}
      <span className="text-[var(--line)]">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export default function StudioReviewsBlock({
  preset,
  heading,
  maxItems,
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

  if (reviews.length === 0) {
    if (!isEditing) return null;
    return (
      <section className="studio-section">
        <div className="studio-section__inner">
          {title}
          <p className="mt-3 rounded-xl border border-dashed border-[var(--line)] bg-[var(--wash)] p-6 text-sm text-[var(--muted)]">
            No reviews yet. Approved customer reviews will appear here.
          </p>
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
            <Stars rating={r.rating} />
            <p className="mt-4 text-xl leading-relaxed text-[var(--field)] sm:text-2xl">
              &ldquo;{r.body}&rdquo;
            </p>
            <footer className="mt-4 text-sm text-[var(--muted)]">— {r.customerName}</footer>
          </blockquote>
        </div>
      </section>
    );
  }

  return (
    <section className="studio-section">
      <div className="studio-section__inner">
        {title}
        <ul className={`mt-8 grid gap-4 ${preset === "quote" ? "grid-cols-1" : "sm:grid-cols-2"}`}>
          {reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-[var(--studio-card-radius)] border border-[var(--line)] bg-white p-5"
            >
              <Stars rating={r.rating} />
              {r.title ? <p className="mt-2 font-semibold text-[var(--field)]">{r.title}</p> : null}
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{r.body}</p>
              <p className="mt-3 text-xs font-medium text-[var(--field)]">{r.customerName}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
