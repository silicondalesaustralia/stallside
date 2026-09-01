import Link from "next/link";

export default function DashboardTopBar({
  liveHref,
  notificationCount = 0,
}: {
  businessName: string;
  liveHref: string | null;
  notificationCount?: number;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-end gap-2 print:hidden">
      {liveHref ? (
        <Link
          href={liveHref}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-3.5 py-2 text-xs font-semibold text-[var(--ink)] shadow-sm hover:border-[var(--leaf)]"
        >
          View live site
        </Link>
      ) : null}
      <Link
        href="/dashboard/notifications"
        className="relative rounded-full border border-[var(--line)] bg-[var(--panel)] px-3.5 py-2 text-xs font-semibold text-[var(--ink)] shadow-sm hover:border-[var(--leaf)]"
      >
        Alerts
        {notificationCount > 0 ? (
          <span className="ml-1.5 inline-flex size-5 items-center justify-center rounded-full bg-[var(--gone)] text-[10px] font-bold text-white">
            {notificationCount > 9 ? "9+" : notificationCount}
          </span>
        ) : null}
      </Link>
      <Link
        href="/dashboard/products/new"
        className="rounded-full bg-[var(--leaf)] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[var(--leaf-dark)]"
      >
        Add product
      </Link>
    </div>
  );
}
