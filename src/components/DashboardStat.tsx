import ChangeBadge from "@/components/ChangeBadge";
import Link from "next/link";

export default function DashboardStat({
  label,
  value,
  href,
  current,
  previous,
}: {
  label: string;
  value: string;
  href?: string;
  current?: number;
  previous?: number;
}) {
  const inner = (
    <>
      {href ? (
        <span className="absolute right-4 top-4 text-sm text-[var(--muted)] transition group-hover:text-[var(--marigold)]">
          ↗
        </span>
      ) : null}
      <p className="text-center text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-3 text-center font-receipt text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
        {value}
      </p>
      {typeof current === "number" && typeof previous === "number" ? (
        <div className="mt-1 flex justify-center">
          <ChangeBadge current={current} previous={previous} />
        </div>
      ) : null}
    </>
  );

  const className = `group relative flex min-w-0 flex-1 flex-col items-center justify-center dash-card px-4 py-5 ${
    href ? "dash-card-click" : ""
  }`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}
