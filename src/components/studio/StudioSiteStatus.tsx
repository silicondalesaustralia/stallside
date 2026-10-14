"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { unpublishFromEditor } from "@/app/dashboard/(gated)/website/studio/publish-state-actions";
import { useStudioEditorChrome } from "./StudioEditorContext";

const BTN = "rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm font-semibold";

/** "Live site" + Unpublish when the site is published; "Preview site" while it's still a draft. */
export default function StudioSiteStatus() {
  const { isPublished, liveUrl, viewPreviewUrl, previewUrl } = useStudioEditorChrome();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function unpublish() {
    if (!window.confirm("Take your website offline? Visitors won't see it until you publish again. Your draft is kept.")) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await unpublishFromEditor();
        if (!result.ok) {
          setError(result.error);
          return;
        }
        router.refresh();
      } catch (err) {
        console.error("[editor unpublish]", err);
        setError("Couldn't reach the server. Try again.");
      }
    });
  }

  if (!isPublished || !liveUrl) {
    return (
      <>
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-900">
          Not published
        </span>
        <a href={viewPreviewUrl ?? previewUrl} target="_blank" rel="noreferrer" className={BTN}>
          Preview site ↗
        </a>
      </>
    );
  }

  return (
    <>
      <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-green-900">
        Live
      </span>
      <a href={liveUrl} target="_blank" rel="noreferrer" className={BTN}>
        Live site ↗
      </a>
      <button type="button" disabled={pending} onClick={unpublish} className={`${BTN} text-[var(--muted)] disabled:opacity-60`}>
        {pending ? "Unpublishing…" : "Unpublish"}
      </button>
      {error ? <span role="alert" className="text-xs text-red-700">{error}</span> : null}
    </>
  );
}
