import type { PageStatus } from "./page-status";

const LOOK: Record<PageStatus, { label: string; title: string; className: string }> = {
  live: { label: "Published", title: "Visible on your live website.", className: "bg-[var(--ok)]/15 text-[var(--ok)]" },
  pending: {
    label: "Not live yet",
    title: "Switched on, but your website hasn't been updated since. Use Update published in the site editor.",
    className: "bg-amber-100 text-amber-800",
  },
  off: { label: "Unpublished", title: "Hidden from your website.", className: "bg-[var(--wash)] text-[var(--muted)]" },
};

export default function PageStatusBadge({ status }: { status: PageStatus }) {
  const look = LOOK[status];
  return (
    <span title={look.title} className={`rounded-full px-2 py-0.5 text-xs font-semibold ${look.className}`}>
      {look.label}
    </span>
  );
}
