import type { ReactNode } from "react";

/** A titled group of fields inside the search profile form. */
export default function ProfileSection({
  title,
  intro,
  children,
  open,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
  open?: boolean;
}) {
  return (
    <details open={open} className="group rounded-xl border border-[var(--line)] p-4">
      <summary className="cursor-pointer list-none font-semibold text-[var(--field)]">
        <span className="mr-2 inline-block transition-transform group-open:rotate-90">›</span>
        {title}
      </summary>
      {intro ? <p className="mt-2 text-xs text-[var(--muted)]">{intro}</p> : null}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </details>
  );
}
