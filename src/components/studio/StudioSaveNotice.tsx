"use client";

import { useStudioEditorChrome } from "./StudioEditorContext";

export default function StudioSaveNotice() {
  const { saveStatus, saveError } = useStudioEditorChrome();
  if (saveStatus !== "conflict" && saveStatus !== "error") return null;

  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-900"
    >
      <span>{saveError ?? "Your changes were not saved."}</span>
      {saveStatus === "conflict" ? (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg border border-amber-400 bg-white px-3 py-1 text-xs font-semibold"
        >
          Reload latest version
        </button>
      ) : null}
    </div>
  );
}
