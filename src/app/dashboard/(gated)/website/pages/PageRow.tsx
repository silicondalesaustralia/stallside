import Link from "next/link";

/** One page in the Pages list, with Preview and Edit buttons. */
export default function PageRow({
  label,
  detail,
  previewUrl,
  editHref,
}: {
  label: string;
  detail: string;
  previewUrl: string;
  editHref: string;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-4 p-5">
      <div>
        <p className="font-semibold text-[var(--field)]">{label}</p>
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
