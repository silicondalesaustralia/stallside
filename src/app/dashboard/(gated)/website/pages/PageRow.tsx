import Link from "next/link";
import type { PageStatus } from "./page-status";
import PageStatusBadge from "./PageStatusBadge";

/** One page in the Pages list: its status, Preview, Publish/Unpublish and Edit. */
export default function PageRow({
  label,
  detail,
  status,
  previewUrl,
  editHref,
  toggleAction,
}: {
  label: string;
  detail: string;
  status: PageStatus;
  previewUrl: string;
  editHref: string;
  /** Omitted for pages that can't be switched off (the home page). */
  toggleAction?: () => Promise<void>;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-4 p-5">
      <div>
        <p className="flex flex-wrap items-center gap-2 font-semibold text-[var(--field)]">
          {label}
          <PageStatusBadge status={status} />
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">{detail}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <a
          href={previewUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-[var(--line)] px-3 py-1.5 text-sm font-semibold"
        >
          Preview
        </a>
        {toggleAction ? (
          <form action={toggleAction}>
            <button type="submit" className="rounded-full border border-[var(--line)] px-3 py-1.5 text-sm font-semibold">
              {status === "off" ? "Publish" : "Unpublish"}
            </button>
          </form>
        ) : null}
        <Link
          href={editHref}
          className="rounded-full bg-[var(--field)] px-3 py-1.5 text-sm font-semibold text-white"
        >
          Edit
        </Link>
      </div>
    </li>
  );
}
