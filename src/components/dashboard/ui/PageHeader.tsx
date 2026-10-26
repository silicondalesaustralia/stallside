import Link from "next/link";

/** Title row for dashboard list and detail pages: optional back link, title, badges, actions. */
export default function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel,
  badges,
  actions,
}: {
  title: string;
  subtitle?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        {backHref ? (
          <Link
            href={backHref}
            className="mb-1 inline-flex items-center gap-1 text-sm font-semibold text-[var(--muted)] hover:text-[var(--field)]"
          >
            <span aria-hidden>←</span> {backLabel ?? "Back"}
          </Link>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight">
            {title}
          </h1>
          {badges}
        </div>
        {subtitle ? <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
