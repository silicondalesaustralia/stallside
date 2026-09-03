import Link from "next/link";
import type { HubNavItem } from "@/components/dash-nav-links";
import { hubNavItemActive } from "@/components/dash-nav-links";

export function StatusBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-[var(--wash)] text-[var(--field)] ring-1 ring-[var(--line)]",
    success: "bg-emerald-100 text-emerald-900",
    warning: "bg-amber-100 text-amber-900",
    danger: "bg-red-100 text-red-900",
    info: "bg-sky-100 text-sky-900",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tones[tone]}`}
    >
      {label}
    </span>
  );
}

export function DetailCard({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="dash-card flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function ObjectPageHeader({
  backHref,
  backLabel,
  title,
  badges,
  primaryAction,
  secondaryActions,
}: {
  backHref?: string;
  backLabel?: string;
  title: React.ReactNode;
  badges?: React.ReactNode;
  primaryAction?: React.ReactNode;
  secondaryActions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3">
      {backHref ? (
        <p className="text-sm text-[var(--muted)]">
          <Link href={backHref} className="underline">
            ← {backLabel ?? "Back"}
          </Link>
        </p>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
              {title}
            </h1>
            {badges}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {primaryAction}
          {secondaryActions}
        </div>
      </div>
    </header>
  );
}

export function ObjectSubnav({
  items,
  pathname,
}: {
  items: HubNavItem[];
  pathname: string;
}) {
  return (
    <nav
      aria-label="Section"
      className="flex gap-1 overflow-x-auto border-b border-[var(--line)] pb-px"
    >
      {items.map((item) => {
        const active = hubNavItemActive(pathname, item);
        return (
          <Link
            key={`${item.href}-${item.label}`}
            href={item.href}
            className={`shrink-0 rounded-t-lg px-3 py-2 text-sm font-semibold ${
              active
                ? "border border-b-0 border-[var(--line)] bg-white text-[var(--field)]"
                : "text-[var(--muted)] hover:text-[var(--field)]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
