"use client";

import { useStudioEditorChrome } from "./StudioEditorContext";

/** Save state for all Site Wide Edits style settings. */
export default function SiteStyleSaveStatus() {
  const { siteStyleStatus, siteStyleError } = useStudioEditorChrome();
  if (siteStyleStatus === "saving") return <p className="mt-3 text-xs text-[var(--muted)]">Saving…</p>;
  if (siteStyleStatus === "saved") {
    return <p className="mt-3 text-xs text-[var(--muted)]">Saved to your draft. Goes live when you publish.</p>;
  }
  if (siteStyleStatus === "error") {
    return <p className="mt-3 text-xs text-red-700">{siteStyleError ?? "Couldn't save. Try again."}</p>;
  }
  return null;
}
