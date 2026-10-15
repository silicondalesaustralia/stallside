"use client";

import { useStudioEditorChrome } from "./StudioEditorContext";

/** Toolbar toggle for the Site Wide Edits page. */
export default function SiteWideEditsButton() {
  const { siteWideOpen, setSiteWideOpen } = useStudioEditorChrome();
  return (
    <button
      type="button"
      aria-pressed={Boolean(siteWideOpen)}
      onClick={() => setSiteWideOpen?.(!siteWideOpen)}
      title="Fonts, colours, buttons and layout for every page"
      className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
        siteWideOpen
          ? "border-[var(--field)] bg-[var(--field)] text-white"
          : "border-[var(--line)] text-[var(--field)] hover:bg-[var(--wash)]"
      }`}
    >
      Site wide edits
    </button>
  );
}
