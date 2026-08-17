import ChangeBadge from "@/components/ChangeBadge";
import Link from "next/link";
import type { ReactNode } from "react";

export default function DashboardStat({
  label,
  value,
  href,
  current,
  previous,
}: {
  label: string;
  value: ReactNode;
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
      <div className="mt-3 max-w-full text-center font-receipt text-xl font-semibold tracking-tight tabular-nums sm:text-2xl lg:text-3xl">
        {value}
      </div>
      {typeof current === "number" && typeof previous === "number" ? (
        <div className="mt-1 flex justify-center">
          <ChangeBadge current={current} previous={previous} />
        </div>
      ) : null}
    </>
  );

  const className = `group relative flex min-w-0 flex-col items-center justify-center overflow-hidden dash-card px-3 py-5 sm:px-4 ${
    href ? "dash-card-click flex-1" : "w-full"
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
