"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useStudioEditorChrome, useStudioMetadata } from "./StudioEditorContext";
import { FAVICON_ACCEPT, FAVICON_BEST_PX, FAVICON_MAX_KB, FAVICON_MIN_PX, faviconFileProblem } from "./favicon-file-check";
import SiteFaviconPreview from "./SiteFaviconPreview";

const BUTTON = "rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--field)] hover:bg-[var(--wash)] disabled:opacity-60";

/** Upload the small icon shown in browser tabs, bookmarks and Google results on the seller's own domain. */
export default function SiteFaviconSettings() {
  const { customDomain } = useStudioMetadata();
  const { faviconUrl, uploadFavicon, removeFavicon, faviconStatus, faviconError } = useStudioEditorChrome();
  const inputRef = useRef<HTMLInputElement>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const saving = faviconStatus === "saving";

  if (!customDomain) {
    return (
      <div className="mt-6 space-y-3 border-t border-[var(--line)] pt-4">
        <p className="text-sm">
          Connect your own domain first. Once it&apos;s active, you can add a favicon here so your site shows your
          icon in browser tabs and Google results.
        </p>
        <Link href="/dashboard/website/domains" className={`inline-block ${BUTTON}`}>
          Connect a domain →
        </Link>
      </div>
    );
  }

  async function onPick(file: File | undefined) {
    if (!file) return;
    const reason = await faviconFileProblem(file);
    setProblem(reason);
    if (!reason) await uploadFavicon?.(file);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="mt-6 space-y-4 border-t border-[var(--line)] pt-4">
      <p className="text-sm text-[var(--muted)]">
        Shown in browser tabs, bookmarks and Google results for <strong>{customDomain}</strong>.
      </p>
      <SiteFaviconPreview url={faviconUrl ?? null} domain={customDomain} />
      <div className="flex flex-wrap gap-2">
        <button type="button" className={BUTTON} disabled={saving} onClick={() => inputRef.current?.click()}>
          {faviconUrl ? "Replace favicon" : "Upload favicon"}
        </button>
        {faviconUrl ? (
          <button type="button" className={BUTTON} disabled={saving} onClick={() => removeFavicon?.()}>
            Remove
          </button>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept={FAVICON_ACCEPT}
          className="sr-only"
          aria-label="Favicon file"
          onChange={(e) => onPick(e.target.files?.[0])}
        />
      </div>
      <div className="rounded-lg bg-[var(--wash)] p-3 text-xs text-[var(--ink)]">
        <p className="font-semibold">Size and format</p>
        <ul className="mt-1 list-disc space-y-1 pl-4">
          <li>
            A square image: {FAVICON_BEST_PX} × {FAVICON_BEST_PX} px is best, and at least {FAVICON_MIN_PX} ×{" "}
            {FAVICON_MIN_PX} px.
          </li>
          <li>PNG is best (it keeps a see-through background). ICO and WebP also work. Not JPEG or SVG.</li>
          <li>Under {FAVICON_MAX_KB} KB.</li>
          <li>Keep it simple, like your logo mark or first letter. It shows as small as 16 px, so fine detail and words disappear.</li>
        </ul>
      </div>
      {problem ? <p className="text-xs text-red-700">{problem}</p> : null}
      {saving ? <p className="text-xs text-[var(--muted)]">Saving…</p> : null}
      {faviconStatus === "saved" ? (
        <p className="text-xs text-[var(--muted)]">Saved to your draft. Goes live when you publish.</p>
      ) : null}
      {faviconStatus === "error" ? (
        <p className="text-xs text-red-700">{faviconError ?? "Couldn't save. Try again."}</p>
      ) : null}
    </div>
  );
}
