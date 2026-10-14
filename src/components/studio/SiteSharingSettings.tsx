"use client";

import Link from "next/link";
import { useStudioMetadata } from "./StudioEditorContext";

const LINK = "block rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--field)] hover:bg-[var(--wash)]";

/** Shortcuts to the SEO page and the business social profiles shown in the footer. */
export default function SiteSharingSettings() {
  const { standId } = useStudioMetadata();
  return (
    <div className="mt-6 space-y-3 border-t border-[var(--line)] pt-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Search &amp; social</p>
      <Link href="/dashboard/website/seo" className={LINK}>
        Search &amp; sharing (SEO titles, descriptions, share image) →
      </Link>
      <Link href={`/dashboard/businesses/${standId}`} className={LINK}>
        Social profile links (Instagram, Facebook, TikTok, YouTube) →
      </Link>
      <p className="text-xs text-[var(--muted)]">Social links show in your footer. Turn them off under Footer → Business details.</p>
    </div>
  );
}
