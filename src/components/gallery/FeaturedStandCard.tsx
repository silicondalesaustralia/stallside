import FeaturedStandLinks from "@/components/gallery/FeaturedStandLinks";
import FeaturedStandPhotos from "@/components/gallery/FeaturedStandPhotos";
import type { FeaturedStand } from "@/lib/featured-stands";

export default function FeaturedStandCard({
  stand,
  reverse = false,
}: {
  stand: FeaturedStand;
  reverse?: boolean;
}) {
  return (
    <article
      id={stand.id}
      className="grid scroll-mt-24 items-center gap-8 overflow-hidden rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--panel)] p-4 sm:p-6 lg:grid-cols-2 lg:gap-12 lg:p-8">
      <FeaturedStandPhotos
        images={stand.images}
        className={`mx-auto w-full max-w-md lg:max-w-none ${reverse ? "lg:order-2" : ""}`}
      />
      <div>
        {stand.eyebrow ? (
          <p className="inline-flex rounded-[var(--radius-pill)] bg-[var(--marigold)]/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--warn)]">
            {stand.eyebrow}
          </p>
        ) : null}
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[var(--field)] sm:text-3xl">
          {stand.name}
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">{stand.location}</p>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-[var(--ink)]">
          {stand.description.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
        {stand.highlights?.length ? (
          <ul className="mt-6 flex flex-wrap gap-2">
            {stand.highlights.map((item) => (
              <li
                key={item}
                className="rounded-[var(--radius-pill)] border border-[var(--line)] bg-white px-3 py-1 text-sm font-medium text-[var(--leaf-dark)]"
              >
                {item}
              </li>
            ))}
          </ul>
        ) : null}
        {stand.links ? <FeaturedStandLinks links={stand.links} /> : null}
      </div>
    </article>
  );
}
