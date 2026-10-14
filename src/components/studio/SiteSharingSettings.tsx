"use client";

import Link from "next/link";
import { useStudioMetadata } from "./StudioEditorContext";

const LINK = "block rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--field)] hover:bg-[var(--wash)]";

/** Shortcuts to page search settings and the business social profiles shown in the footer. */
export default function SiteSharingSettings() {
  const { standId } = useStudioMetadata();
  return (
    <div className="mt-6 space-y-3 border-t border-[var(--line)] pt-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Search &amp; social</p>
      <Link href="/dashboard/website/pages" className={LINK}>
        Search &amp; sharing for each page (in Pages, Products, categories and blog) →
      </Link>
      <Link href={`/dashboard/businesses/${standId}`} className={LINK}>
        Social profile links (Instagram, Facebook, TikTok, YouTube) →
      </Link>
      <p className="text-xs text-[var(--muted)]">Social links show as icons on your footer&apos;s bottom line. Turn them off in the footer settings.</p>
    </div>
  );
}
