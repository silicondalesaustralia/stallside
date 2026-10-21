import Link from "next/link";
import SectionCopy from "@/components/studio/SectionCopy";
import SectionElement from "@/components/studio/SectionElement";

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className="mt-0.5 size-4 shrink-0 text-[var(--pc-label)]"
    >
      <rect
        x="2.5"
        y="4"
        width="15"
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M2.5 8h15M7 2.5v3M13 2.5v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function PreOrderCategoryCard({
  href,
  title,
  imageUrl,
  statusLabel,
  shortDescription,
  handoverHeading,
  dateLabel,
  orderByLabel,
  showImage = true,
  showDescription = true,
}: {
  href: string;
  title: string;
  imageUrl: string | null;
  statusLabel: string | null;
  shortDescription: string;
  handoverHeading: string;
  dateLabel: string;
  orderByLabel: string | null;
  showImage?: boolean;
  showDescription?: boolean;
}) {
  return (
    <article data-section-card className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)]">
      {!showImage ? null : imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="sf-photo sf-photo-frame w-full bg-[var(--wash)]"
        />
      ) : (
        <div className="sf-photo-box w-full bg-[var(--line)]" />
      )}
      <div className="flex flex-1 flex-col p-5">
        {statusLabel ? (
          <SectionElement el="cardLabel" className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--pc-label)]">
            <SectionCopy k="cardStatus" fallback={statusLabel} />
          </SectionElement>
        ) : null}
        <h2
          className={`font-[family-name:var(--font-display)] text-[23px] font-medium leading-[1.25] tracking-tight sm:text-[25px] ${
            statusLabel ? "mt-2" : ""
          }`}
        >
          <SectionElement el="cardTitle" as="span">
            {title}
          </SectionElement>
        </h2>
        {showDescription ? (
          <SectionElement el="cardText" className="mt-2 text-[15px] leading-relaxed text-[var(--muted)]">
            {shortDescription}
          </SectionElement>
        ) : null}
        <div className="mt-auto border-t border-[var(--line)] pt-4">
          <div className="flex gap-2.5">
            <CalendarIcon />
            <div className="min-w-0">
              <SectionElement el="factLabel" className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">
                {handoverHeading}
              </SectionElement>
              <SectionElement el="factValue" className="mt-0.5 text-sm font-medium leading-snug">
                {dateLabel}
              </SectionElement>
              {orderByLabel ? (
                <SectionElement el="smallPrint" className="mt-1 text-[13px] leading-snug text-[var(--muted)]">
                  <SectionCopy k="orderBy" fallback="Order by" /> {orderByLabel}
                </SectionElement>
              ) : null}
            </div>
          </div>
          <Link
            href={href}
            className="offer-btn mt-4 flex min-h-11 w-full items-center justify-center rounded-lg bg-[var(--pc-action)] px-4 py-3 text-sm font-semibold text-[var(--pc-action-text)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pc-action)]"
            aria-label={`View ${title} pre-order`}
          >
            <SectionCopy k="cardButton" fallback="View pre-order →" />
          </Link>
        </div>
      </div>
    </article>
  );
}
