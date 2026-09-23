import Link from "next/link";

export default function MembershipCategoryCard({
  href,
  title,
  imageUrl,
  quantityLabel,
  shortDescription,
  priceAmount,
  priceUnit,
  termLine,
}: {
  href: string;
  title: string;
  imageUrl: string | null;
  quantityLabel: string | null;
  shortDescription: string;
  priceAmount: string | null;
  priceUnit: string | null;
  termLine: string | null;
}) {
  return (
    <article className="membership-card flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--mc-border)] bg-[var(--mc-card)]">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="aspect-[16/9] w-full object-cover sm:aspect-[16/10]"
        />
      ) : (
        <div className="aspect-[16/9] w-full bg-[var(--mc-divider)] sm:aspect-[16/10]" />
      )}
      <div className="flex flex-1 flex-col p-5">
        {quantityLabel ? (
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mc-label)]">
            {quantityLabel}
          </p>
        ) : null}
        <h2
          className={`font-[family-name:var(--font-display)] text-[25px] font-medium leading-[1.2] tracking-tight ${
            quantityLabel ? "mt-2" : ""
          }`}
        >
          {title}
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[var(--mc-muted)]">
          {shortDescription}
        </p>
        <div className="mt-auto border-t border-[var(--mc-divider)] pt-4">
          {priceAmount ? (
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-[28px] font-semibold leading-none tracking-tight">
                {priceAmount}
              </span>
              {priceUnit ? (
                <span className="text-sm text-[var(--mc-muted)]">{priceUnit}</span>
              ) : null}
            </p>
          ) : null}
          {termLine ? (
            <p className="mt-2 text-[13px] leading-snug text-[var(--mc-muted)]">
              {termLine}
            </p>
          ) : null}
          <Link
            href={href}
            className="mt-4 flex min-h-11 w-full items-center justify-center rounded-lg bg-[var(--mc-action)] px-4 py-3 text-sm font-semibold text-[var(--mc-action-text)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mc-action)]"
            aria-label={`View ${title} membership`}
          >
            View membership →
          </Link>
        </div>
      </div>
    </article>
  );
}