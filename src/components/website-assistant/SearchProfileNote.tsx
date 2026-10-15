import Link from "next/link";

export const SEARCH_PROFILE_HREF = "/dashboard/website/web-studio?tab=details#search-profile";

type Props = { complete: boolean; summary: string[] };

/** The Google & search profile feeds structured data and the AI; it's edited in Details & publish. */
export default function SearchProfileNote({ complete, summary }: Props) {
  if (!complete) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p className="font-medium">Add your Google & search profile</p>
        <p className="mt-1">
          Your business type, address and opening hours help you appear in Google and Maps, and let the AI write accurate
          Visit and FAQ pages.
        </p>
        <Link href={SEARCH_PROFILE_HREF} className="mt-2 inline-block font-medium underline">
          Set up search profile
        </Link>
      </div>
    );
  }
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm">
      <p className="font-medium text-[var(--field)]">Using your Google & search profile</p>
      {summary.length > 0 ? (
        <ul className="mt-1 list-disc pl-5 text-xs text-[var(--muted)]">
          {summary.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      ) : null}
      <Link href={SEARCH_PROFILE_HREF} className="mt-2 inline-block text-xs text-[var(--muted)] underline">
        Edit search profile
      </Link>
    </div>
  );
}
