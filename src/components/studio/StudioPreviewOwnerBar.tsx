import Link from "next/link";

/** Owner-only bar on read-only draft preview → enter inline edit. */
export default function StudioPreviewOwnerBar({
  editHref,
  dashboardHref,
}: {
  editHref: string;
  dashboardHref: string;
}) {
  return (
    <div className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--field)] text-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-sm">
        <p className="font-medium">Draft preview — only you can see this.</p>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={dashboardHref}
            className="rounded-full border border-white/30 px-3 py-1.5 text-xs font-semibold hover:bg-white/10"
          >
            Web Studio
          </Link>
          <Link
            href={editHref}
            className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--field)]"
          >
            Edit on this page
          </Link>
        </div>
      </div>
    </div>
  );
}
