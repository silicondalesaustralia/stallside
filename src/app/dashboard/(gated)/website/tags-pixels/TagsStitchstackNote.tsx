import { STITCHSTACK_APP_URL, STITCHSTACK_ANALYTICS_HANDOFF_PATH } from "@/lib/stitchstack";

/** Explains base Tags & Pixels vs Stitchstack for pixel analytics / GA4 / GSC. */
export default function TagsStitchstackNote() {
  return (
    <aside className="rounded-xl border border-teal-600/25 bg-teal-50 px-4 py-3 text-sm text-[var(--field)]">
      <p>
        This page covers <span className="font-semibold">base-level</span> platform pixels and tags
        (Meta, TikTok, ads tags, verification for Bing/Meta/Pinterest, and similar).
      </p>
      <p className="mt-2">
        Site analytics start with the{" "}
        <a
          href={STITCHSTACK_ANALYTICS_HANDOFF_PATH}
          className="font-semibold text-teal-800 underline hover:text-teal-700"
        >
          Stitchstack Analytics
        </a>{" "}
        pixel (auto-installed on your live site when you open it). Google Analytics 4 and Search
        Console are optional enrichments inside{" "}
        <a
          href={STITCHSTACK_APP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-teal-800 underline hover:text-teal-700"
        >
          Stitchstack.app
        </a>
        .
        <span className="sr-only"> Stitchstack.app opens in a new tab.</span>
      </p>
    </aside>
  );
}
