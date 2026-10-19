import type { ReactNode } from "react";

/** Titled card used for each block in the article sidebar. */
export default function SidebarSection({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[var(--radius-md)] bg-[var(--panel)] p-5 ring-1 ring-[var(--line)] ${className}`}>
      <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
