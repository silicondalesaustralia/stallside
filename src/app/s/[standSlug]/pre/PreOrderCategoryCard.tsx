import Link from "next/link";

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
}: {
  href: string;
  title: string;
  imageUrl: string | null;
  statusLabel: string | null;
  shortDescription: string;
  handoverHeading: string;
  dateLabel: string;
  orderByLabel: string | null;
}) {
  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)]">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="aspect-[16/9] w-full object-cover sm:aspect-[16/10]"
        />
      ) : (
        <div className="aspect-[16/9] w-full bg-[var(--line)] sm:aspect-[16/10]" />
      )}
      <div className="flex flex-1 flex-col p-5">
        {statusLabel ? (
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--pc-label)]">
            {statusLabel}
          </p>
        ) : null}
        <h2
          className={`font-[family-name:var(--font-display)] text-[23px] font-medium leading-[1.25] tracking-tight sm:text-[25px] ${
            statusLabel ? "mt-2" : ""
          }`}
        >
          {title}
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[var(--muted)]">
          {shortDescription}
        </p>
        <div className="mt-auto border-t border-[var(--line)] pt-4">
          <div className="flex gap-2.5">
            <CalendarIcon />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">
                {handoverHeading}
              </p>
              <p className="mt-0.5 text-sm font-medium leading-snug">{dateLabel}</p>
              {orderByLabel ? (
                <p className="mt-1 text-[13px] leading-snug text-[var(--muted)]">
                  Order by {orderByLabel}
                </p>
              ) : null}
            </div>
          </div>
          <Link
            href={href}
            className="mt-4 flex min-h-11 w-full items-center justify-center rounded-lg bg-[var(--pc-action)] px-4 py-3 text-sm font-semibold text-[var(--pc-action-text)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pc-action)]"
            aria-label={`View ${title} pre-order`}
          >
            View pre-order →
          </Link>
        </div>
      </div>
    </article>
  );
}
