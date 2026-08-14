import Link from "next/link";
import DashPrimaryCta from "@/components/DashPrimaryCta";

export default function DashboardChannelCard({
  title,
  count,
  unit,
  empty,
  detail,
  href,
  ctaHref,
  cta,
}: {
  title: string;
  count: number;
  unit: string;
  empty: string;
  detail?: string;
  href: string;
  ctaHref: string;
  cta: string;
}) {
  return (
    <div className="dash-card flex min-h-[180px] flex-1 flex-col p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
        {title}
      </p>
      <p className="mt-3 font-receipt text-3xl font-semibold tabular-nums">
        {count}{" "}
        <span className="text-base font-sans font-semibold text-[var(--muted)]">
          {unit}
        </span>
      </p>
      <p className="mt-2 flex-1 text-sm text-[var(--muted)]">
        {count === 0 ? empty : (detail ?? null)}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <DashPrimaryCta href={ctaHref}>{cta}</DashPrimaryCta>
        {count > 0 ? (
          <Link
            href={href}
            className="text-sm font-semibold text-[var(--leaf-dark)]"
          >
            Open
          </Link>
        ) : null}
      </div>
    </div>
  );
}
