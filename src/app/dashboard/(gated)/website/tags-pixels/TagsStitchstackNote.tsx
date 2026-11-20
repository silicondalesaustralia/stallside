import { STITCHSTACK_APP_URL } from "@/lib/stitchstack";

/** Explains base Tags & Pixels vs Stitchstack for GA4 / GSC / advanced tracking. */
export default function TagsStitchstackNote() {
  return (
    <aside className="rounded-xl border border-teal-600/25 bg-teal-50 px-4 py-3 text-sm text-[var(--field)]">
      <p>
        This page covers <span className="font-semibold">base-level</span> platform pixels and tags
        (Meta, TikTok, ads tags, verification for Bing/Meta/Pinterest, and similar).
      </p>
      <p className="mt-2">
        Google Analytics 4 and Google Search Console are set up in{" "}
        <a
          href={STITCHSTACK_APP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-teal-800 underline hover:text-teal-700"
        >
          Stitchstack.app
        </a>{" "}
        (included for Vendl sellers). For advanced tracking and Stitchstack premium features, open
        Stitchstack from the sidebar or visit that link.
        <span className="sr-only"> (opens in a new tab)</span>
      </p>
    </aside>
  );
}
